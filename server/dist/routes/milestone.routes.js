"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. LIST ALL MILESTONES
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const milestones = await prisma.milestone.findMany({
            orderBy: { targetValue: 'asc' },
        });
        let achievedMap = new Map();
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch milestones.' });
    }
});
// 2. GET USER MILESTONES
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userMilestones = await prisma.userMilestone.findMany({
            where: { userId },
            include: { milestone: true },
            orderBy: { achievedAt: 'desc' },
        });
        res.json({ userMilestones });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch user milestones.' });
    }
});
exports.default = router;
