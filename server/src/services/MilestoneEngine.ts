import { PrismaClient } from '@prisma/client';
import { NotificationService } from './NotificationService';

const prisma = new PrismaClient();

export class MilestoneEngine {
  /**
   * Evaluate milestone completions for a user
   */
  static async evaluateMilestones(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            certificate: true,
          },
        },
        milestones: {
          include: {
            milestone: true,
          },
        },
        teamMemberships: true,
      },
    });

    if (!user) return [];

    const existingMilestoneCodes = new Set(
      user.milestones.map((m) => m.milestone.code)
    );
    const allMilestones = await prisma.milestone.findMany();
    const newlyAchievedCodes: string[] = [];

    const totalProjects = user.projects.length;
    const winnerProjects = user.projects.filter((p) => p.status === 'Winner').length;
    const verifiedCertificates = user.projects.filter(
      (p) => p.isVerified && p.certificate?.status === 'VERIFIED'
    ).length;

    const ruleChecks: Record<string, boolean> = {
      FIRST_PROJECT: totalProjects >= 1,
      FIRST_WIN: winnerProjects >= 1,
      FIRST_TEAM: user.teamMemberships.length >= 1,
      FIRST_CERTIFICATE: verifiedCertificates >= 1,
      POINTS_50: user.points >= 50,
      POINTS_100: user.points >= 100,
      POINTS_500: user.points >= 500,
      POINTS_1000: user.points >= 1000,
      RANK_TOP_100: user.currentRank > 0 && user.currentRank <= 100,
      RANK_TOP_10: user.currentRank > 0 && user.currentRank <= 10,
      RANK_NUM_ONE: user.currentRank === 1,
      STREAK_3_MONTH: totalProjects >= 3,
    };

    for (const milestone of allMilestones) {
      if (!existingMilestoneCodes.has(milestone.code) && ruleChecks[milestone.code]) {
        await prisma.userMilestone.create({
          data: {
            userId,
            milestoneId: milestone.id,
          },
        });
        newlyAchievedCodes.push(milestone.code);

        await NotificationService.sendNotification({
          userId,
          type: 'MILESTONE_ACHIEVED',
          title: `Milestone Achieved: ${milestone.title}!`,
          message: `You reached a major career achievement: "${milestone.title}". Keep pushing forward!`,
          link: `/profile/${user.username}`,
          emailCategory: 'ACHIEVEMENTS',
          emailSubject: `🎯 Milestone Unlocked: ${milestone.title} on HackTracker!`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #6366f1; border-radius: 12px; background: #0b0f17; color: #f3f4f6;">
              <h2 style="color: #818cf8; margin-bottom: 8px;">Milestone Achieved: ${milestone.title} 🎯</h2>
              <p style="font-size: 16px; color: #d1d5db;">Hi ${user.name},</p>
              <p style="font-size: 15px; color: #9ca3af;">Your dedication to hackathons just unlocked a new milestone:</p>
              <div style="background: #111827; padding: 16px; border-radius: 8px; border-left: 4px solid #818cf8; margin: 20px 0;">
                <h3 style="margin: 0; color: #fff;">${milestone.title}</h3>
                <p style="margin: 6px 0 0 0; color: #9ca3af;">${milestone.description}</p>
              </div>
              <a href="http://localhost:5173/profile/${user.username}" style="display: inline-block; background: #6366f1; color: #fff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px;">View Your Profile</a>
            </div>
          `,
        });
      }
    }

    return newlyAchievedCodes;
  }
}
