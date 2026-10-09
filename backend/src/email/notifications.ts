import { config } from '../config.js';
import { db } from '../db.js';
import { queueEmail } from './mailer.js';
import {
  bookingCancelledAdminEmail,
  bookingReceivedAdminEmail,
  bookingReceivedClientEmail,
  bookingStatusClientEmail,
  contactAutoReplyEmail,
  contactReceivedAdminEmail,
  defaultBrand,
  profileUpdatedEmail,
  verifyEmailTemplate,
  welcomeEmail,
  type BrandInfo,
} from './templates.js';

function localizedName(value: unknown) {
  if (!value || typeof value !== 'object') return 'Tour';
  const record = value as { en?: string; fr?: string };
  return record.en || record.fr || 'Tour';
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

async function getBrand(): Promise<BrandInfo> {
  const settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
  if (!settings) return defaultBrand();
  return {
    companyName: settings.companyName || defaultBrand().companyName,
    companyTagline: settings.companyTagline || defaultBrand().companyTagline,
    contactEmail: settings.contactEmail || config.adminEmail,
    phoneNumber: settings.phoneNumber || '',
    location: settings.location || '',
  };
}

async function getNotifyTo(brand: BrandInfo) {
  return config.mail.notifyTo || brand.contactEmail || config.adminEmail;
}

export async function notifyWelcome(user: { name: string; email: string }) {
  const brand = await getBrand();
  const content = welcomeEmail(brand, user.name);
  queueEmail({ to: user.email, ...content });
}

export async function notifyVerifyEmail(user: {
  name: string;
  email: string;
  code: string;
  token: string;
}) {
  const brand = await getBrand();
  const content = verifyEmailTemplate(brand, user);
  queueEmail({ to: user.email, ...content });
}

export async function notifyBookingCreated(booking: {
  tourDate: Date;
  guests: number;
  totalPriceUsd: number;
  status: string;
  notes?: string | null;
  contactPhone?: string | null;
  tour: { name: unknown };
  clientUser?: { name: string; email: string; phone?: string | null } | null;
  clientUserId: string;
}) {
  const brand = await getBrand();
  const client =
    booking.clientUser ||
    (await db.clientUser.findUnique({ where: { id: booking.clientUserId } }));
  if (!client) return;

  const tourName = localizedName(booking.tour.name);
  const tourDate = formatDate(booking.tourDate);
  const notifyTo = await getNotifyTo(brand);

  const clientMail = bookingReceivedClientEmail(brand, {
    clientName: client.name,
    tourName,
    tourDate,
    guests: booking.guests,
    totalUsd: booking.totalPriceUsd,
    status: booking.status,
  });
  queueEmail({ to: client.email, ...clientMail });

  const adminMail = bookingReceivedAdminEmail(brand, {
    clientName: client.name,
    clientEmail: client.email,
    clientPhone: booking.contactPhone || client.phone,
    tourName,
    tourDate,
    guests: booking.guests,
    totalUsd: booking.totalPriceUsd,
    notes: booking.notes,
  });
  queueEmail({ to: notifyTo, ...adminMail, replyTo: client.email });
}

export async function notifyBookingStatusChanged(booking: {
  tourDate: Date;
  guests: number;
  totalPriceUsd: number;
  status: string;
  tour: { name: unknown };
  clientUser?: { name: string; email: string } | null;
  clientUserId: string;
}) {
  const brand = await getBrand();
  const client =
    booking.clientUser ||
    (await db.clientUser.findUnique({ where: { id: booking.clientUserId } }));
  if (!client) return;

  const content = bookingStatusClientEmail(brand, {
    clientName: client.name,
    tourName: localizedName(booking.tour.name),
    tourDate: formatDate(booking.tourDate),
    guests: booking.guests,
    totalUsd: booking.totalPriceUsd,
    status: booking.status,
  });
  queueEmail({ to: client.email, ...content });
}

export async function notifyBookingCancelledByClient(booking: {
  tourDate: Date;
  guests: number;
  totalPriceUsd: number;
  tour: { name: unknown };
  clientUser?: { name: string; email: string } | null;
  clientUserId: string;
}) {
  const brand = await getBrand();
  const client =
    booking.clientUser ||
    (await db.clientUser.findUnique({ where: { id: booking.clientUserId } }));
  if (!client) return;

  const tourName = localizedName(booking.tour.name);
  const tourDate = formatDate(booking.tourDate);
  const notifyTo = await getNotifyTo(brand);

  const adminMail = bookingCancelledAdminEmail(brand, {
    clientName: client.name,
    clientEmail: client.email,
    tourName,
    tourDate,
  });
  queueEmail({ to: notifyTo, ...adminMail, replyTo: client.email });

  const clientMail = bookingStatusClientEmail(brand, {
    clientName: client.name,
    tourName,
    tourDate,
    guests: booking.guests,
    totalUsd: booking.totalPriceUsd,
    status: 'cancelled',
  });
  queueEmail({ to: client.email, ...clientMail });
}

export async function notifyContactMessage(message: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  const brand = await getBrand();
  const notifyTo = await getNotifyTo(brand);

  const adminMail = contactReceivedAdminEmail(brand, message);
  queueEmail({ to: notifyTo, ...adminMail, replyTo: message.email });

  const autoReply = contactAutoReplyEmail(brand, message.name);
  queueEmail({ to: message.email, ...autoReply });
}

export async function notifyProfileUpdated(input: {
  name: string;
  email: string;
  emailChanged: boolean;
  passwordChanged: boolean;
}) {
  if (!input.emailChanged && !input.passwordChanged) return;
  const brand = await getBrand();
  const content = profileUpdatedEmail(brand, input);
  queueEmail({ to: input.email, ...content });
}
