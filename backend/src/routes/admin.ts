import { Router } from 'express';
import { config } from '../config.js';
import { db } from '../db.js';
import { requireAdmin, type AuthedRequest } from '../middleware/auth.js';
import {
  clearAuthCookie,
  setAuthCookie,
  signSession,
  verifyAdminToken,
} from '../utils/jwt.js';
import { verifyPassword } from '../utils/password.js';
import { defaultSiteSettingsPayload } from '../utils/default-settings.js';
import {
  serializeBooking,
  serializeClientUser,
  serializeContactMessage,
  serializeGalleryItem,
  serializeOffer,
  serializeSiteSettings,
  serializeTour,
} from '../utils/serializers.js';
import {
  bookingStatusSchema,
  contactMessageStatusSchema,
  galleryInputSchema,
  loginSchema,
  offerInputSchema,
  settingsInputSchema,
  tourInputSchema,
} from '../utils/validators.js';
import { notifyBookingStatusChanged } from '../email/notifications.js';

const defaultSettings = defaultSiteSettingsPayload;

export const adminRouter = Router();

adminRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid login payload' });
    return;
  }

  const admin = await db.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!admin) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const session = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: 'admin' as const,
  };
  const token = await signSession(session);
  clearAuthCookie(res, config.clientCookie);
  setAuthCookie(res, config.adminCookie, token);

  res.json({
    authenticated: true,
    session: { id: admin.id, email: admin.email, name: admin.name },
  });
});

adminRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res, config.adminCookie);
  res.json({ ok: true });
});

adminRouter.get('/session', async (req: AuthedRequest, res) => {
  try {
    const token = req.cookies?.[config.adminCookie];
    if (typeof token === 'string') {
      const admin = await verifyAdminToken(token);
      if (admin) {
        res.json({
          authenticated: true,
          session: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          },
        });
        return;
      }
    }
  } catch {
    // fall through
  }

  res.json({ authenticated: false, session: null });
});

adminRouter.get('/tours', requireAdmin, async (_req, res) => {
  const tours = await db.tour.findMany({ orderBy: [{ createdAt: 'desc' }] });
  res.json(tours.map(serializeTour));
});

adminRouter.post('/tours', requireAdmin, async (req, res) => {
  const parsed = tourInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid tour payload' });
    return;
  }

  const tour = await db.tour.create({ data: parsed.data });
  res.status(201).json(serializeTour(tour));
});

adminRouter.patch('/tours/:id', requireAdmin, async (req, res) => {
  const parsed = tourInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid tour payload' });
    return;
  }

  try {
    const tour = await db.tour.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(serializeTour(tour));
  } catch {
    res.status(404).json({ message: 'Tour not found' });
  }
});

adminRouter.delete('/tours/:id', requireAdmin, async (req, res) => {
  try {
    await db.tour.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ message: 'Tour not found or has related bookings' });
  }
});

adminRouter.get('/offers', requireAdmin, async (_req, res) => {
  const offers = await db.offer.findMany({ orderBy: [{ createdAt: 'desc' }] });
  res.json(offers.map(serializeOffer));
});

adminRouter.post('/offers', requireAdmin, async (req, res) => {
  const parsed = offerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid offer payload' });
    return;
  }

  const offer = await db.offer.create({ data: parsed.data });
  res.status(201).json(serializeOffer(offer));
});

adminRouter.patch('/offers/:id', requireAdmin, async (req, res) => {
  const parsed = offerInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid offer payload' });
    return;
  }

  try {
    const offer = await db.offer.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(serializeOffer(offer));
  } catch {
    res.status(404).json({ message: 'Offer not found' });
  }
});

adminRouter.delete('/offers/:id', requireAdmin, async (req, res) => {
  try {
    await db.offer.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ message: 'Offer not found' });
  }
});

adminRouter.get('/gallery', requireAdmin, async (_req, res) => {
  const items = await db.galleryItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  res.json(items.map(serializeGalleryItem));
});

adminRouter.post('/gallery', requireAdmin, async (req, res) => {
  const parsed = galleryInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid gallery payload' });
    return;
  }

  const item = await db.galleryItem.create({ data: parsed.data });
  res.status(201).json(serializeGalleryItem(item));
});

adminRouter.patch('/gallery/:id', requireAdmin, async (req, res) => {
  const parsed = galleryInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid gallery payload' });
    return;
  }

  try {
    const item = await db.galleryItem.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(serializeGalleryItem(item));
  } catch {
    res.status(404).json({ message: 'Gallery item not found' });
  }
});

adminRouter.delete('/gallery/:id', requireAdmin, async (req, res) => {
  try {
    await db.galleryItem.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ message: 'Gallery item not found' });
  }
});

adminRouter.get('/settings', requireAdmin, async (_req, res) => {
  const settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
  res.json(settings ? serializeSiteSettings(settings) : defaultSettings);
});

adminRouter.patch('/settings', requireAdmin, async (req, res) => {
  const parsed = settingsInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid settings payload' });
    return;
  }

  const settings = await db.siteSettings.upsert({
    where: { id: 'main' },
    update: parsed.data,
    create: { id: 'main', ...parsed.data },
  });

  res.json(serializeSiteSettings(settings));
});

adminRouter.get('/bookings', requireAdmin, async (_req, res) => {
  const bookings = await db.booking.findMany({
    include: { tour: true, clientUser: true },
    orderBy: [{ createdAt: 'desc' }],
  });
  res.json(bookings.map(serializeBooking));
});

adminRouter.patch('/bookings/:id', requireAdmin, async (req, res) => {
  const parsed = bookingStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid booking payload' });
    return;
  }

  try {
    const existing = await db.booking.findUnique({ where: { id: req.params.id } });
    const booking = await db.booking.update({
      where: { id: req.params.id },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes || null,
      },
      include: { tour: true, clientUser: true },
    });

    if (!existing || existing.status !== booking.status) {
      void notifyBookingStatusChanged(booking);
    }

    res.json(serializeBooking(booking));
  } catch {
    res.status(404).json({ message: 'Booking not found' });
  }
});

adminRouter.get('/clients', requireAdmin, async (_req, res) => {
  const clients = await db.clientUser.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: { _count: { select: { bookings: true } } },
  });

  res.json(
    clients.map((client) => ({
      ...serializeClientUser(client),
      bookingsCount: client._count.bookings,
    })),
  );
});

adminRouter.get('/contact-messages', requireAdmin, async (_req, res) => {
  const messages = await db.contactMessage.findMany({
    orderBy: [{ createdAt: 'desc' }],
  });
  res.json(messages.map(serializeContactMessage));
});

adminRouter.patch('/contact-messages/:id', requireAdmin, async (req, res) => {
  const parsed = contactMessageStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid status' });
    return;
  }

  try {
    const message = await db.contactMessage.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json(serializeContactMessage(message));
  } catch {
    res.status(404).json({ message: 'Contact message not found' });
  }
});

adminRouter.delete('/contact-messages/:id', requireAdmin, async (req, res) => {
  try {
    await db.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(404).json({ message: 'Contact message not found' });
  }
});
