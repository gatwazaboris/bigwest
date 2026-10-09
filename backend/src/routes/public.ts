import { Router } from 'express';
import { db } from '../db.js';
import { notifyContactMessage } from '../email/notifications.js';
import { requireClient, type AuthedRequest } from '../middleware/auth.js';
import { defaultSiteSettingsPayload } from '../utils/default-settings.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  serializeContactMessage,
  serializeGalleryItem,
  serializeOffer,
  serializeSiteSettings,
  serializeTour,
} from '../utils/serializers.js';
import { contactMessageInputSchema } from '../utils/validators.js';

export const publicRouter = Router();

publicRouter.get(
  '/bootstrap',
  asyncHandler(async (_req, res) => {
    const [settings, tours, offers, gallery] = await Promise.all([
      db.siteSettings.findUnique({ where: { id: 'main' } }),
      db.tour.findMany({
        where: { status: 'published' },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      }),
      db.offer.findMany({ where: { active: true }, orderBy: [{ updatedAt: 'desc' }] }),
      db.galleryItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
    ]);

    res.json({
      settings: settings ? serializeSiteSettings(settings) : defaultSiteSettingsPayload,
      tours: tours.map(serializeTour),
      offers: offers.map(serializeOffer),
      gallery: gallery.map(serializeGalleryItem),
    });
  }),
);

publicRouter.post(
  '/contact',
  requireClient,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = contactMessageInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid contact message' });
      return;
    }

    const client = await db.clientUser.findUnique({ where: { id: req.client!.id } });
    if (!client) {
      res.status(401).json({ message: 'Please log in to continue' });
      return;
    }

    const created = await db.contactMessage.create({
      data: {
        name: client.name || parsed.data.name,
        email: client.email,
        phone: parsed.data.phone?.trim() || client.phone || null,
        message: parsed.data.message,
        status: 'new',
      },
    });

    void notifyContactMessage(created);
    res.status(201).json(serializeContactMessage(created));
  }),
);
