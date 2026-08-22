import { PrismaClient } from '@prisma/client';
import { NotificationService } from './NotificationService';

const prisma = new PrismaClient();

export class BadgeEngine {
  /**
   * Evaluate all badge rules for a user and award any newly unlocked badges
   */
  static async evaluateBadges(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            certificate: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
        skills: {
          include: {
            endorsements: true,
          },
        },
        teamMemberships: true,
      },
    });

    if (!user) return [];

    const existingBadgeCodes = new Set(user.badges.map((b) => b.badge.code));
    const allBadges = await prisma.badge.findMany();
    const newlyUnlockedCodes: string[] = [];

    const totalProjects = user.projects.length;
    const winnerProjects = user.projects.filter((p) => p.status === 'Winner').length;
    const verifiedCertificates = user.projects.filter(
      (p) => p.isVerified && p.certificate?.status === 'VERIFIED'
    ).length;
    const teamProjects = user.projects.filter((p) => !p.isSolo || p.teamId).length;
    
    let totalEndorsements = 0;
    for (const skill of user.skills) {
      totalEndorsements += skill.endorsements.length;
    }

    // Rules Mapping
    const ruleChecks: Record<string, boolean> = {
      FIRST_STEP: totalProjects >= 1,
      FIRST_WINNER: winnerProjects >= 1,
      PROJECT_MASTER: totalProjects >= 5,
      HACKATHON_CHAMPION: winnerProjects >= 3,
      LEGENDARY_HACKER: winnerProjects >= 5,
      PERFECT_TRUST: user.trustScore >= 95.0 && verifiedCertificates >= 2,
      TEAM_PLAYER: (user.teamMemberships.length >= 1 && teamProjects >= 1),
      TRUST_BUILDER: user.trustScore >= 75.0,
      SKILL_SPECIALIST: totalEndorsements >= 5,
      TRUST_GUARDIAN: verifiedCertificates >= 3,
    };

    for (const badge of allBadges) {
      if (!existingBadgeCodes.has(badge.code) && ruleChecks[badge.code]) {
        // Unlock badge
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: badge.id,
          },
        });
        newlyUnlockedCodes.push(badge.code);

        // Send In-App & Registered-Email Notifications
        await NotificationService.sendNotification({
          userId,
          type: 'BADGE_UNLOCKED',
          title: `New Badge Unlocked: ${badge.name}!`,
          message: `Congratulations! You unlocked the "${badge.name}" badge (${badge.tier} tier). +${badge.pointsAward} points awarded!`,
          link: '/dashboard',
          emailCategory: 'ACHIEVEMENTS',
          emailSubject: `🏆 Badge Unlocked: ${badge.name} on HackTracker!`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #14b8a6; border-radius: 12px; background: #0b0f17; color: #f3f4f6;">
              <h2 style="color: #14b8a6; margin-bottom: 8px;">Badge Unlocked: ${badge.name} ✨</h2>
              <p style="font-size: 16px; color: #d1d5db;">Hi ${user.name},</p>
              <p style="font-size: 15px; color: #9ca3af;">You have just unlocked a prestigious new milestone badge on HackTracker:</p>
              <div style="background: #111827; padding: 16px; border-radius: 8px; border-left: 4px solid #14b8a6; margin: 20px 0;">
                <h3 style="margin: 0; color: #fff;">${badge.name} (${badge.tier} Tier)</h3>
                <p style="margin: 6px 0 0 0; color: #9ca3af;">${badge.description}</p>
                <p style="margin: 6px 0 0 0; color: #14b8a6; font-weight: bold;">+${badge.pointsAward} Platform Points</p>
              </div>
              <a href="http://localhost:5173/dashboard" style="display: inline-block; background: #14b8a6; color: #000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px;">View Your Dashboard</a>
            </div>
          `,
        });
      }
    }

    return newlyUnlockedCodes;
  }
}
