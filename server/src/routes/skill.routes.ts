import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import { TrustScoreService } from '../services/TrustScoreService';
import { BadgeEngine } from '../services/BadgeEngine';
import { NotificationService } from '../services/NotificationService';

const router = Router();
const prisma = new PrismaClient();

// 1. LIST ALL MASTER SKILLS
router.get('/', async (req, res): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ skills });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch skills catalog.' });
  }
});

// 2. GET SKILLS FOR A USER
router.get('/user/:userId', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: true,
        endorsements: {
          include: {
            endorser: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
      },
      orderBy: { endorsementCount: 'desc' },
    });

    res.json({ userSkills });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user skills.' });
  }
});

// 3. ADD SKILL TO USER PROFILE
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillName, category, proficiencyLevel = 'Intermediate' } = req.body;
    const userId = req.user.id;

    if (!skillName || typeof skillName !== 'string' || !skillName.trim()) {
      res.status(400).json({ error: 'Skill name is required.' });
      return;
    }

    // Find or create skill in master catalog
    let skill = await prisma.skill.findUnique({
      where: { name: skillName.trim() },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillName.trim(),
          category: category || 'Programming',
        },
      });
    }

    // Check if user already added this skill
    const existing = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId: skill.id,
        },
      },
    });

    if (existing) {
      const updated = await prisma.userSkill.update({
        where: { id: existing.id },
        data: { proficiencyLevel },
        include: { skill: true, endorsements: true },
      });
      res.json({ message: 'Skill proficiency updated.', userSkill: updated });
      return;
    }

    const created = await prisma.userSkill.create({
      data: {
        userId,
        skillId: skill.id,
        proficiencyLevel,
        endorsementCount: 0,
      },
      include: { skill: true, endorsements: true },
    });

    res.status(201).json({ message: 'Skill added to profile!', userSkill: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add skill: ' + err.message });
  }
});

// 4. ENDORSE A SKILL
router.post('/:userSkillId/endorse', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userSkillId = req.params.userSkillId as string;
    const endorserId = req.user.id;

    const userSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
      include: { user: true, skill: true },
    });

    if (!userSkill) {
      res.status(404).json({ error: 'User skill not found.' });
      return;
    }

    if (userSkill.userId === endorserId) {
      res.status(400).json({ error: 'You cannot endorse your own skills.' });
      return;
    }

    const existingEndorsement = await prisma.skillEndorsement.findUnique({
      where: {
        userSkillId_endorserId: {
          userSkillId,
          endorserId,
        },
      },
    });

    if (existingEndorsement) {
      // Remove endorsement
      await prisma.skillEndorsement.delete({
        where: { id: existingEndorsement.id },
      });

      await prisma.userSkill.update({
        where: { id: userSkillId },
        data: { endorsementCount: { decrement: 1 } },
      });

      await TrustScoreService.recalculateUserScore(userSkill.userId);
      res.json({ endorsed: false, message: 'Endorsement removed.' });
      return;
    }

    // Add endorsement
    await prisma.skillEndorsement.create({
      data: {
        userSkillId,
        endorserId,
      },
    });

    await prisma.userSkill.update({
      where: { id: userSkillId },
      data: { endorsementCount: { increment: 1 } },
    });

    // Recalculate score and check badges
    await TrustScoreService.recalculateUserScore(userSkill.userId);
    const unlockedBadges = await BadgeEngine.evaluateBadges(userSkill.userId);

    // Send notification to target user
    await NotificationService.sendNotification({
      userId: userSkill.userId,
      type: 'TEAM_ACTIVITY',
      title: `Skill Endorsement: ${userSkill.skill.name}`,
      message: `${req.user.name} endorsed your proficiency in ${userSkill.skill.name}!`,
      link: `/profile/${userSkill.user.username}`,
      emailCategory: 'ACHIEVEMENTS',
      emailSubject: `🌟 ${req.user.name} endorsed your ${userSkill.skill.name} skill on HackTracker!`,
      emailHtml: `<p>Hi ${userSkill.user.name}, ${req.user.name} just endorsed your expertise in <strong>${userSkill.skill.name}</strong>!</p>`,
    });

    res.json({
      endorsed: true,
      message: `You endorsed ${userSkill.user.name}'s ${userSkill.skill.name} skill!`,
      unlockedBadges,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to endorse skill: ' + err.message });
  }
});

// 5. DELETE SKILL
router.delete('/:userSkillId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userSkillId = req.params.userSkillId as string;
    const userId = req.user.id;

    const userSkill = await prisma.userSkill.findUnique({
      where: { id: userSkillId },
    });

    if (!userSkill || userSkill.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this skill.' });
      return;
    }

    await prisma.userSkill.delete({ where: { id: userSkillId } });
    await TrustScoreService.recalculateUserScore(userId);

    res.json({ message: 'Skill removed from profile.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
});

export default router;
