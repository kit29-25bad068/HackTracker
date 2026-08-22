"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. LIST ALL BADGES WITH UNLOCKED STATUS
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const badges = await prisma.badge.findMany({
            orderBy: { pointsAward: 'asc' },
        });
        let unlockedBadgeIds = new Set();
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch badges.' });
    }
});
// 2. GET USER BADGES
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
            orderBy: { unlockedAt: 'desc' },
        });
        res.json({ userBadges });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch user badges.' });
    }
});
exports.default = router;
