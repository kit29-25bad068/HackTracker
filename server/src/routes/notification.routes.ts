import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL NOTIFICATIONS FOR LOGGED IN USER
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { type, unreadOnly } = req.query;

    const where: any = { userId };
    if (type && type !== 'All') {
      where.type = type as string;
    }
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// 2. MARK SINGLE NOTIFICATION AS READ
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// 3. MARK SINGLE NOTIFICATION AS UNREAD
router.patch('/:id/unread', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: false },
    });

    res.json({ message: 'Notification marked as unread.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// 4. MARK ALL AS READ
router.post('/mark-all-read', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

// 5. DELETE NOTIFICATION
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: { id, userId },
    });

    res.json({ message: 'Notification deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
});

// 6. GET NOTIFICATION PREFERENCES
router.get('/preferences', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const defaultCategories = [
      'PROJECT_VERIFICATION',
      'RANK_CHANGES',
      'ACHIEVEMENTS',
      'TEAM_UPDATES',
      'DEADLINES',
      'RECOMMENDATIONS',
    ];

    const existingPrefs = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    const prefMap = new Map(existingPrefs.map((p) => [p.category, p]));

    const results = defaultCategories.map((cat) => {
      const p = prefMap.get(cat);
      return {
        category: cat,
        inApp: p ? p.inApp : true,
        emailMode: p ? p.emailMode : cat === 'RANK_CHANGES' ? 'DAILY_DIGEST' : 'INSTANT',
      };
    });

    res.json({ preferences: results });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notification preferences.' });
  }
});

// 7. UPDATE NOTIFICATION PREFERENCES
router.put('/preferences', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      res.status(400).json({ error: 'Preferences must be an array.' });
      return;
    }

    for (const pref of preferences) {
      await prisma.notificationPreference.upsert({
        where: {
          userId_category: {
            userId,
            category: pref.category,
          },
        },
        create: {
          userId,
          category: pref.category,
          inApp: pref.inApp ?? true,
          emailMode: pref.emailMode ?? 'INSTANT',
        },
        update: {
          inApp: pref.inApp,
          emailMode: pref.emailMode,
        },
      });
    }

    res.json({ message: 'Notification preferences updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

// 8. GET EMAIL OUTBOX LOGS
router.get('/email-outbox', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const emails = await prisma.emailNotification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: 20,
    });

    res.json({ emails });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch email outbox.' });
  }
});

export default router;
