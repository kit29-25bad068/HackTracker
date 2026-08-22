"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. GET ACTIVE SESSIONS
router.get('/sessions', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const currentToken = req.token;
        const sessions = await prisma.session.findMany({
            where: { userId },
            orderBy: { lastActiveAt: 'desc' },
        });
        const enriched = sessions.map((s) => ({
            id: s.id,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            device: s.device,
            lastActiveAt: s.lastActiveAt,
            isCurrent: s.token === currentToken,
        }));
        res.json({ sessions: enriched });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch active sessions.' });
    }
});
// 2. LOGOUT FROM ALL OTHER SESSIONS
router.post('/sessions/revoke-others', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const currentToken = req.token;
        await prisma.session.deleteMany({
            where: {
                userId,
                token: { not: currentToken },
            },
        });
        await prisma.securityEvent.create({
            data: {
                userId,
                type: 'SESSION_REVOKED',
                description: 'All other active device sessions were revoked.',
                ipAddress: req.ip,
            },
        });
        res.json({ message: 'All other device sessions have been revoked.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to revoke other sessions.' });
    }
});
// 3. GET LOGIN HISTORY / SECURITY AUDIT LOGS
router.get('/history', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const events = await prisma.securityEvent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json({ events });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch security logs.' });
    }
});
exports.default = router;
