"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustScoreService = void 0;
const client_1 = require("@prisma/client");
const constants_1 = require("../config/constants");
const prisma = new client_1.PrismaClient();
class TrustScoreService {
    /**
     * Recalculate trust score, points, final score, and ranks for a user
     */
    static async recalculateUserScore(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                projects: {
                    include: {
                        certificate: true,
                    },
                },
                badges: true,
                skills: {
                    include: {
                        endorsements: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        let calculatedTrust = constants_1.TRUST_SCORE_CONFIG.BASE_SCORE;
        let calculatedPoints = 0;
        let winsCount = 0;
        let verifiedCount = 0;
        let manualCount = 0;
        for (const project of user.projects) {
            // Points calculation
            calculatedPoints += constants_1.POINTS_CONFIG.PROJECT_SUBMISSION;
            if (project.status === 'Winner') {
                calculatedPoints += constants_1.POINTS_CONFIG.PROJECT_WIN;
                winsCount++;
            }
            if (project.teamId) {
                calculatedPoints += constants_1.POINTS_CONFIG.TEAM_PROJECT_BONUS;
            }
            // Trust score calculation
            if (project.isVerified && project.certificate?.status === 'VERIFIED') {
                calculatedTrust += constants_1.TRUST_SCORE_CONFIG.OCR_VERIFIED_BONUS;
                verifiedCount++;
            }
            else {
                calculatedTrust += constants_1.TRUST_SCORE_CONFIG.MANUAL_PROJECT_BONUS;
                manualCount++;
            }
        }
        // Badge points bonus
        calculatedPoints += user.badges.length * constants_1.POINTS_CONFIG.BADGE_EARNED;
        // Endorsement points bonus
        let totalEndorsements = 0;
        for (const s of user.skills) {
            totalEndorsements += s.endorsements.length;
        }
        calculatedPoints += totalEndorsements * constants_1.POINTS_CONFIG.SKILL_ENDORSEMENT;
        // Consecutive verified bonus
        if (verifiedCount >= 3) {
            calculatedTrust += constants_1.TRUST_SCORE_CONFIG.CONSECUTIVE_VERIFIED_BONUS;
        }
        // Clamp trust score between 0% and 100%
        calculatedTrust = Math.min(constants_1.TRUST_SCORE_CONFIG.MAX_SCORE, Math.max(constants_1.TRUST_SCORE_CONFIG.MIN_SCORE, calculatedTrust));
        // Final score formula: Final Score = Points * (Trust Score / 100)
        const finalScore = parseFloat((calculatedPoints * (calculatedTrust / 100.0)).toFixed(2));
        // Update user record
        await prisma.user.update({
            where: { id: userId },
            data: {
                trustScore: parseFloat(calculatedTrust.toFixed(1)),
                points: calculatedPoints,
                finalScore,
                winsCount,
            },
        });
        // Recalculate overall ranks for all users
        await this.recalculateLeaderboardRanks();
        // Recalculate team scores if user belongs to teams
        const teamMemberships = await prisma.teamMember.findMany({
            where: { userId },
            select: { teamId: true },
        });
        for (const tm of teamMemberships) {
            await this.recalculateTeamScore(tm.teamId);
        }
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                trustScore: true,
                points: true,
                finalScore: true,
                currentRank: true,
            },
        });
        return (updatedUser || {
            trustScore: calculatedTrust,
            points: calculatedPoints,
            finalScore,
            currentRank: user.currentRank,
        });
    }
    /**
     * Recalculate leaderboard ranks based on final score descending
     */
    static async recalculateLeaderboardRanks() {
        const allUsers = await prisma.user.findMany({
            where: { isDeleted: false },
            orderBy: [{ finalScore: 'desc' }, { trustScore: 'desc' }, { points: 'desc' }],
            select: { id: true, currentRank: true },
        });
        for (let index = 0; index < allUsers.length; index++) {
            const newRank = index + 1;
            const oldRank = allUsers[index].currentRank || newRank;
            const rankChange = oldRank - newRank; // positive means improved
            await prisma.user.update({
                where: { id: allUsers[index].id },
                data: {
                    currentRank: newRank,
                    rankChange,
                },
            });
        }
    }
    /**
     * Recalculate aggregated team points and average trust score
     */
    static async recalculateTeamScore(teamId) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    include: {
                        user: {
                            include: {
                                projects: true,
                            },
                        },
                    },
                },
                projects: true,
            },
        });
        if (!team)
            return;
        let totalPoints = 0;
        let trustSum = 0;
        let winsCount = 0;
        const activeMembers = team.members.filter((m) => m.status === 'ACTIVE');
        for (const member of activeMembers) {
            totalPoints += member.user.points;
            trustSum += member.user.trustScore;
            winsCount += member.user.winsCount;
        }
        const averageTrust = activeMembers.length > 0
            ? parseFloat((trustSum / activeMembers.length).toFixed(1))
            : 50.0;
        await prisma.team.update({
            where: { id: teamId },
            data: {
                totalPoints,
                averageTrust,
                winsCount,
            },
        });
    }
}
exports.TrustScoreService = TrustScoreService;
