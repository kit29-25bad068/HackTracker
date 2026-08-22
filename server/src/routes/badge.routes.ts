import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. LIST ALL BADGES WITH UNLOCKED STATUS
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { pointsAward: 'asc' },
    });

    let unlockedBadgeIds = new Set<string>();
    if (req.user) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: req.user.id },
        select: { badgeId: true },
      });
      unlockedBadgeIds = new Set(userBadges.map((b) => b.badgeId));
    }

    const enriched = badges.map((b) => ({
      ...b,
      isUnlocked: unlockedBadgeIds.has(b.id),
    }));

    res.json({ badges: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch badges.' });
  }
});

// 2. GET USER BADGES
router.get('/user/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: 'desc' },
    });
    res.json({ userBadges });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user badges.' });
  }
});

export default router;
