"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const TrustScoreService_1 = require("../services/TrustScoreService");
const NotificationService_1 = require("../services/NotificationService");
const BadgeEngine_1 = require("../services/BadgeEngine");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. LIST TEAMS
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { search, department, limit = '20', page = '1' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (department && department !== 'All') {
            where.department = department;
        }
        if (search && typeof search === 'string' && search.trim()) {
            const q = search.trim();
            where.OR = [{ name: { contains: q } }, { description: { contains: q } }];
        }
        const total = await prisma.team.count({ where });
        const teams = await prisma.team.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { totalPoints: 'desc' },
            include: {
                leader: {
                    select: { id: true, name: true, username: true, avatar: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true, avatar: true, trustScore: true },
                        },
                    },
                },
                _count: { select: { projects: true } },
            },
        });
        res.json({
            teams,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch teams: ' + err.message });
    }
});
// 2. GET SINGLE TEAM
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const team = await prisma.team.findFirst({
            where: {
                OR: [{ id }, { slug: id }],
            },
            include: {
                leader: {
                    select: { id: true, name: true, username: true, avatar: true, email: true, department: true },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                avatar: true,
                                department: true,
                                year: true,
                                trustScore: true,
                                points: true,
                                winsCount: true,
                            },
                        },
                    },
                },
                projects: {
                    include: {
                        hackathon: true,
                        certificate: true,
                        user: { select: { name: true, username: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                invites: {
                    where: { status: 'PENDING' },
                    include: {
                        user: { select: { id: true, name: true, username: true, avatar: true } },
                    },
                },
            },
        });
        if (!team) {
            res.status(404).json({ error: 'Team not found.' });
            return;
        }
        res.json({ team });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch team details.' });
    }
});
// 3. CREATE TEAM
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, description, logoUrl, department } = req.body;
        const user = req.user;
        if (!name || typeof name !== 'string' || !name.trim()) {
            res.status(400).json({ error: 'Team name is required.' });
            return;
        }
        let slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const existing = await prisma.team.findFirst({ where: { OR: [{ name }, { slug }] } });
        if (existing) {
            res.status(400).json({ error: 'A team with this name or handle already exists.' });
            return;
        }
        const team = await prisma.team.create({
            data: {
                name: name.trim(),
                slug,
                description: description ? description.trim() : null,
                logoUrl: logoUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
                leaderId: user.id,
                department: department || user.department || 'CSE',
                totalPoints: user.points,
                averageTrust: user.trustScore,
                winsCount: user.winsCount,
                members: {
                    create: {
                        userId: user.id,
                        role: 'LEADER',
                        status: 'ACTIVE',
                    },
                },
            },
            include: {
                leader: { select: { id: true, name: true, username: true, avatar: true } },
                members: {
                    include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
                },
            },
        });
        await BadgeEngine_1.BadgeEngine.evaluateBadges(user.id);
        res.status(201).json({ message: 'Team created successfully!', team });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create team: ' + err.message });
    }
});
// 4. INVITE USER TO TEAM
router.post('/:id/invite', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const { usernameOrEmail } = req.body;
        const currentUserId = req.user.id;
        if (!usernameOrEmail || typeof usernameOrEmail !== 'string') {
            res.status(400).json({ error: 'Email or username is required.' });
            return;
        }
        const team = await prisma.team.findUnique({
            where: { id },
            include: { members: true },
        });
        if (!team) {
            res.status(404).json({ error: 'Team not found.' });
            return;
        }
        if (team.leaderId !== currentUserId) {
            res.status(403).json({ error: 'Only the team leader can invite new members.' });
            return;
        }
        const targetUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: usernameOrEmail.trim().toLowerCase() },
                    { username: usernameOrEmail.trim().toLowerCase() },
                ],
            },
        });
        if (!targetUser) {
            res.status(404).json({ error: 'User with that email or username was not found.' });
            return;
        }
        const isAlreadyMember = team.members.some((m) => m.userId === targetUser.id);
        if (isAlreadyMember) {
            res.status(400).json({ error: 'User is already a member of this team.' });
            return;
        }
        const invite = await prisma.teamInvite.create({
            data: {
                teamId: team.id,
                userId: targetUser.id,
                email: targetUser.email,
                status: 'PENDING',
            },
        });
        await NotificationService_1.NotificationService.sendNotification({
            userId: targetUser.id,
            type: 'TEAM_INVITE',
            title: `Team Invitation: ${team.name}`,
            message: `${req.user.name} invited you to join team "${team.name}".`,
            link: `/teams/${team.id}`,
            emailCategory: 'TEAM_UPDATES',
            emailSubject: `🤝 You were invited to join ${team.name} on HackTracker!`,
            emailHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #14b8a6; border-radius: 12px; background: #0b0f17; color: #f3f4f6;">
          <h2 style="color: #14b8a6; margin-bottom: 8px;">Team Invitation: ${team.name} 👥</h2>
          <p style="font-size: 16px; color: #d1d5db;">Hi ${targetUser.name},</p>
          <p style="font-size: 15px; color: #9ca3af;"><strong>${req.user.name}</strong> has invited you to collaborate in <strong>${team.name}</strong>.</p>
          <div style="background: #111827; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #fff;"><strong>Team:</strong> ${team.name}</p>
            <p style="margin: 4px 0 0 0; color: #9ca3af;">${team.description || 'No description provided.'}</p>
          </div>
          <a href="http://localhost:5173/teams/${team.id}" style="display: inline-block; background: #14b8a6; color: #000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px;">Respond to Invitation</a>
        </div>
      `,
        });
        res.status(201).json({ message: `Invitation sent to ${targetUser.name}!`, invite });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to send invite: ' + err.message });
    }
});
// 5. ACCEPT TEAM INVITATION
router.post('/:id/accept', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const invite = await prisma.teamInvite.findFirst({
            where: {
                teamId: id,
                userId,
                status: 'PENDING',
            },
            include: { team: true },
        });
        if (!invite) {
            res.status(404).json({ error: 'Pending invitation not found.' });
            return;
        }
        await prisma.teamInvite.update({
            where: { id: invite.id },
            data: { status: 'ACCEPTED' },
        });
        await prisma.teamMember.create({
            data: {
                teamId: id,
                userId,
                role: 'MEMBER',
                status: 'ACTIVE',
            },
        });
        await TrustScoreService_1.TrustScoreService.recalculateTeamScore(id);
        await BadgeEngine_1.BadgeEngine.evaluateBadges(userId);
        await NotificationService_1.NotificationService.sendNotification({
            userId: invite.team.leaderId,
            type: 'TEAM_ACTIVITY',
            title: 'New Team Member Joined!',
            message: `${req.user.name} accepted your invitation to join ${invite.team.name}.`,
            link: `/teams/${id}`,
            emailCategory: 'TEAM_UPDATES',
            emailSubject: `🎉 ${req.user.name} joined ${invite.team.name}!`,
            emailHtml: `<p>${req.user.name} has accepted the invitation and joined your team roster!</p>`,
        });
        res.json({ message: `You have successfully joined ${invite.team.name}!` });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to accept invitation.' });
    }
});
// 6. REJECT TEAM INVITATION
router.post('/:id/reject', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        await prisma.teamInvite.updateMany({
            where: {
                teamId: id,
                userId,
                status: 'PENDING',
            },
            data: { status: 'REJECTED' },
        });
        res.json({ message: 'Invitation declined.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to decline invitation.' });
    }
});
// 7. REMOVE MEMBER
router.delete('/:id/members/:targetUserId', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const targetUserId = req.params.targetUserId;
        const currentUserId = req.user.id;
        const team = await prisma.team.findUnique({ where: { id } });
        if (!team) {
            res.status(404).json({ error: 'Team not found.' });
            return;
        }
        if (team.leaderId !== currentUserId && currentUserId !== targetUserId) {
            res.status(403).json({ error: 'Unauthorized to remove this member.' });
            return;
        }
        if (team.leaderId === targetUserId) {
            res.status(400).json({ error: 'The team leader cannot be removed from the team.' });
            return;
        }
        await prisma.teamMember.delete({
            where: {
                teamId_userId: {
                    teamId: id,
                    userId: targetUserId,
                },
            },
        });
        await TrustScoreService_1.TrustScoreService.recalculateTeamScore(id);
        res.json({ message: 'Member removed from team.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to remove member.' });
    }
});
exports.default = router;
