import { Router } from 'express';
import { config } from '../config.js';
import { db } from '../db.js';
import { requireClient, type AuthedRequest } from '../middleware/auth.js';
import { setAuthCookie, signSession } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { serializeBooking, serializeClientUser } from '../utils/serializers.js';
import { bookingInputSchema, clientProfileUpdateSchema } from '../utils/validators.js';
import {
  notifyBookingCancelledByClient,
  notifyBookingCreated,
  notifyProfileUpdated,
} from '../email/notifications.js';

export const clientRouter = Router();

clientRouter.use(requireClient);

clientRouter.get('/me', async (req: AuthedRequest, res) => {
  const user = await db.clientUser.findUnique({ where: { id: req.client!.id } });
  if (!user) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  res.json(serializeClientUser(user));
});

clientRouter.patch('/me', async (req: AuthedRequest, res) => {
  const parsed = clientProfileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid profile payload' });
    return;
  }

  const current = await db.clientUser.findUnique({ where: { id: req.client!.id } });
  if (!current) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  if (email !== current.email) {
    const takenClient = await db.clientUser.findUnique({ where: { email } });
    if (takenClient) {
      res.status(409).json({ message: 'Another account already uses this email' });
      return;
    }
    const takenAdmin = await db.adminUser.findUnique({ where: { email } });
    if (takenAdmin) {
      res.status(409).json({ message: 'This email is reserved for admin use' });
      return;
    }
  }

  let passwordHash = current.passwordHash;
  if (parsed.data.newPassword) {
    const valid = await verifyPassword(parsed.data.currentPassword || '', current.passwordHash);
    if (!valid) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }
    passwordHash = await hashPassword(parsed.data.newPassword);
  }

  const emailChanged = email !== current.email;
  const passwordChanged = Boolean(parsed.data.newPassword);

  const user = await db.clientUser.update({
    where: { id: current.id },
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone?.trim() || null,
      profileImage: parsed.data.profileImage || '',
      passwordHash,
    },
  });

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'client' as const,
  };
  const token = await signSession(session);
  setAuthCookie(res, config.clientCookie, token);

  void notifyProfileUpdated({
    name: user.name,
    email: user.email,
    emailChanged,
    passwordChanged,
  });

  res.json(serializeClientUser(user));
});

clientRouter.get('/bookings', async (req: AuthedRequest, res) => {
  const bookings = await db.booking.findMany({
    where: { clientUserId: req.client!.id },
    include: { tour: true },
    orderBy: [{ createdAt: 'desc' }],
  });
  res.json(bookings.map(serializeBooking));
});

clientRouter.post('/bookings', async (req: AuthedRequest, res) => {
  const me = await db.clientUser.findUnique({ where: { id: req.client!.id } });
  if (!me) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  if (!me.emailVerified) {
    res.status(403).json({ message: 'Please verify your email before booking a tour' });
    return;
  }

  const parsed = bookingInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid booking payload' });
    return;
  }

  const tour = await db.tour.findUnique({ where: { id: parsed.data.tourId } });
  if (!tour || tour.status !== 'published') {
    res.status(404).json({ message: 'Tour not found or unavailable' });
    return;
  }

  const tourDate = new Date(`${parsed.data.tourDate}T12:00:00.000Z`);
  if (Number.isNaN(tourDate.getTime())) {
    res.status(400).json({ message: 'Invalid tour date' });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (tourDate < today) {
    res.status(400).json({ message: 'Tour date must be today or in the future' });
    return;
  }

  const booking = await db.booking.create({
    data: {
      clientUserId: req.client!.id,
      tourId: tour.id,
      tourDate,
      guests: parsed.data.guests,
      notes: parsed.data.notes || null,
      contactPhone: parsed.data.contactPhone || null,
      totalPriceUsd: Number((tour.priceUsd * parsed.data.guests).toFixed(2)),
      status: 'pending',
    },
    include: { tour: true, clientUser: true },
  });

  void notifyBookingCreated(booking);

  res.status(201).json(serializeBooking(booking));
});

clientRouter.patch('/bookings/:id/cancel', async (req: AuthedRequest, res) => {
  const booking = await db.booking.findFirst({
    where: { id: req.params.id, clientUserId: req.client!.id },
  });

  if (!booking) {
    res.status(404).json({ message: 'Booking not found' });
    return;
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });
    return;
  }

  const updated = await db.booking.update({
    where: { id: booking.id },
    data: { status: 'cancelled' },
    include: { tour: true, clientUser: true },
  });

  void notifyBookingCancelledByClient(updated);

  res.json(serializeBooking(updated));
});
