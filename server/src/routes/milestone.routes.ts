import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// 1. LIST ALL MILESTONES
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const milestones = await prisma.milestone.findMany({
      orderBy: { targetValue: 'asc' },
    });

    let achievedMap = new Map<string, Date>();
    if (req.user) {
      const userMilestones = await prisma.userMilestone.findMany({
        where: { userId: req.user.id },
      });
      userMilestones.forEach((um) => achievedMap.set(um.milestoneId, um.achievedAt));
    }

    const enriched = milestones.map((m) => ({
      ...m,
      isAchieved: achievedMap.has(m.id),
      achievedAt: achievedMap.get(m.id) || null,
    }));

    res.json({ milestones: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch milestones.' });
  }
});

// 2. GET USER MILESTONES
router.get('/user/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const userMilestones = await prisma.userMilestone.findMany({
      where: { userId },
      include: { milestone: true },
      orderBy: { achievedAt: 'desc' },
    });
    res.json({ userMilestones });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user milestones.' });
  }
});

export default router;
