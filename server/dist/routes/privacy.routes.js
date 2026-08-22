"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const EmailService_1 = require("../services/EmailService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. GET PRIVACY SETTINGS
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        let privacy = await prisma.privacySetting.findUnique({
            where: { userId },
        });
        if (!privacy) {
            privacy = await prisma.privacySetting.create({
                data: { userId },
            });
        }
        res.json({ privacy });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch privacy settings.' });
    }
});
// 2. UPDATE PRIVACY SETTINGS
router.put('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { profileVisibility, emailVisibility, projectsVisibility, achievementsVisibility, rankVisibility, skillsVisibility, shareWithRecruiters, shareWithOrganizers, } = req.body;
        const updated = await prisma.privacySetting.upsert({
            where: { userId },
            create: {
                userId,
                profileVisibility: profileVisibility || 'PUBLIC',
                emailVisibility: !!emailVisibility,
                projectsVisibility: projectsVisibility !== undefined ? !!projectsVisibility : true,
                achievementsVisibility: achievementsVisibility !== undefined ? !!achievementsVisibility : true,
                rankVisibility: rankVisibility !== undefined ? !!rankVisibility : true,
                skillsVisibility: skillsVisibility !== undefined ? !!skillsVisibility : true,
                shareWithRecruiters: shareWithRecruiters !== undefined ? !!shareWithRecruiters : true,
                shareWithOrganizers: shareWithOrganizers !== undefined ? !!shareWithOrganizers : true,
            },
            update: {
                profileVisibility,
                emailVisibility,
                projectsVisibility,
                achievementsVisibility,
                rankVisibility,
                skillsVisibility,
                shareWithRecruiters,
                shareWithOrganizers,
            },
        });
        res.json({ message: 'Privacy settings updated successfully.', privacy: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update privacy settings.' });
    }
});
// 3. EXPORT USER DATA (JSON)
router.get('/export/json', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const fullData = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                privacySettings: true,
                notificationPrefs: true,
                skills: { include: { skill: true, endorsements: true } },
                badges: { include: { badge: true } },
                milestones: { include: { milestone: true } },
                projects: { include: { certificate: true, hackathon: true } },
                teamMemberships: { include: { team: true } },
                savedHackathons: { include: { hackathon: true } },
                integrations: true,
            },
        });
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${req.user.username}_hacktracker_export.json"`);
        res.send(JSON.stringify(fullData, null, 2));
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to export data.' });
    }
});
// 4. REQUEST ACCOUNT DELETION (7-day grace period)
router.post('/delete-request', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;
        if (!password) {
            res.status(400).json({ error: 'Password confirmation is required to request account deletion.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, req.user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Incorrect password.' });
            return;
        }
        const deletionDate = new Date();
        await prisma.user.update({
            where: { id: userId },
            data: {
                deletionRequestedAt: deletionDate,
            },
        });
        // Send confirmation email to registered address
        await EmailService_1.EmailService.sendEmail({
            userId,
            templateType: 'ACCOUNT_DELETION',
            subject: '⚠️ HackTracker Account Deletion Request (7-Day Grace Period)',
            htmlContent: `
        <p>Hi ${req.user.name},</p>
        <p>We received a request to permanently delete your HackTracker account.</p>
        <p>Your account has been scheduled for permanent deletion in <strong>7 days</strong>. If this was a mistake, you can log in to your account at any time within the next 7 days and cancel this deletion request from your Settings page.</p>
      `,
        });
        res.json({
            message: 'Account deletion requested. Your account is scheduled for deletion after a 7-day grace period.',
            deletionRequestedAt: deletionDate,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to process deletion request.' });
    }
});
// 5. CANCEL DELETION REQUEST
router.post('/delete-cancel', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.user.update({
            where: { id: userId },
            data: { deletionRequestedAt: null },
        });
        res.json({ message: 'Account deletion request has been canceled.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to cancel deletion request.' });
    }
});
exports.default = router;
