"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. GET PUBLIC USER PROFILE
router.get('/:username', auth_1.optionalAuth, async (req, res) => {
    try {
        const username = req.params.username;
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { id: username }],
                isDeleted: false,
            },
            include: {
                privacySettings: true,
                skills: {
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
                },
                badges: {
                    include: { badge: true },
                    orderBy: { unlockedAt: 'desc' },
                },
                milestones: {
                    include: { milestone: true },
                    orderBy: { achievedAt: 'desc' },
                },
                projects: {
                    include: {
                        hackathon: true,
                        certificate: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                teamMemberships: {
                    include: {
                        team: {
                            select: { id: true, name: true, slug: true, logoUrl: true, totalPoints: true },
                        },
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found.' });
            return;
        }
        const isSelf = req.user?.id === user.id;
        const privacy = user.privacySettings;
        // Filter fields based on privacy rules if not viewing own profile
        const safeProfile = {
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            bannerUrl: user.bannerUrl,
            bio: user.bio,
            college: user.college,
            location: user.location,
            department: user.department,
            year: user.year,
            githubUrl: user.githubUrl,
            linkedinUrl: user.linkedinUrl,
            twitterUrl: user.twitterUrl,
            portfolioUrl: user.portfolioUrl,
            devpostUrl: user.devpostUrl,
            createdAt: user.createdAt,
            email: isSelf || privacy?.emailVisibility ? user.email : null,
            trustScore: isSelf || privacy?.profileVisibility !== 'HIDDEN' ? user.trustScore : 50.0,
            points: isSelf || privacy?.profileVisibility !== 'HIDDEN' ? user.points : 0,
            finalScore: isSelf || privacy?.profileVisibility !== 'HIDDEN' ? user.finalScore : 0.0,
            currentRank: isSelf || privacy?.rankVisibility ? user.currentRank : null,
            rankChange: isSelf || privacy?.rankVisibility ? user.rankChange : 0,
            winsCount: isSelf || privacy?.achievementsVisibility ? user.winsCount : 0,
            skills: isSelf || privacy?.skillsVisibility ? user.skills : [],
            badges: isSelf || privacy?.achievementsVisibility ? user.badges : [],
            milestones: isSelf || privacy?.achievementsVisibility ? user.milestones : [],
            projects: isSelf || privacy?.projectsVisibility ? user.projects : [],
            teams: user.teamMemberships.map((tm) => tm.team),
            privacySettings: isSelf ? user.privacySettings : undefined,
        };
        res.json({ user: safeProfile, profile: safeProfile });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch user profile: ' + err.message });
    }
});
// 2. UPDATE PROFILE
router.put('/profile', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, college, location, department, year, bannerUrl, githubUrl, linkedinUrl, twitterUrl, portfolioUrl, devpostUrl, } = req.body;
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name ? name.trim() : undefined,
                bio: bio !== undefined ? bio.trim() : undefined,
                college: college !== undefined ? college.trim() : undefined,
                location: location !== undefined ? location.trim() : undefined,
                department: department || undefined,
                year: year || undefined,
                bannerUrl: bannerUrl !== undefined ? (bannerUrl ? bannerUrl.trim() : null) : undefined,
                githubUrl: githubUrl !== undefined ? (githubUrl ? githubUrl.trim() : null) : undefined,
                linkedinUrl: linkedinUrl !== undefined ? (linkedinUrl ? linkedinUrl.trim() : null) : undefined,
                twitterUrl: twitterUrl !== undefined ? (twitterUrl ? twitterUrl.trim() : null) : undefined,
                portfolioUrl: portfolioUrl !== undefined ? (portfolioUrl ? portfolioUrl.trim() : null) : undefined,
                devpostUrl: devpostUrl !== undefined ? (devpostUrl ? devpostUrl.trim() : null) : undefined,
            },
        });
        res.json({ message: 'Profile updated successfully!', user: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});
// 3. UPLOAD AVATAR
router.post('/avatar', auth_1.requireAuth, upload_1.upload.single('avatar'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Please select an image file to upload.' });
            return;
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: avatarUrl },
        });
        res.json({ message: 'Profile avatar updated!', avatarUrl, user: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to upload avatar.' });
    }
});
// 3.1 UPLOAD COVER / BANNER IMAGE
router.post('/banner', auth_1.requireAuth, (req, res, next) => {
    upload_1.upload.single('banner')(req, res, (err) => {
        if (err) {
            res.status(400).json({ error: err.message || 'File upload error.' });
            return;
        }
        next();
    });
}, async (req, res) => {
    try {
        const file = req.file;
        const { bannerUrl: directUrl } = req.body;
        let bannerUrl = directUrl;
        if (file) {
            bannerUrl = `/uploads/banners/${file.filename}`;
        }
        if (!bannerUrl && !file) {
            res.status(400).json({ error: 'Please provide an image file or URL.' });
            return;
        }
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { bannerUrl },
        });
        res.json({ message: 'Cover background updated!', bannerUrl, user: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to upload cover background: ' + err.message });
    }
});
// 4. GET PUBLIC RECRUITER-READY PORTFOLIO
router.get('/portfolio/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { id: username }],
                isDeleted: false,
            },
            include: {
                privacySettings: true,
                skills: {
                    include: { skill: true, endorsements: true },
                    orderBy: { endorsementCount: 'desc' },
                },
                projects: {
                    include: {
                        hackathon: true,
                        certificate: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                badges: {
                    include: { badge: true },
                    orderBy: { unlockedAt: 'desc' },
                },
                milestones: {
                    include: { milestone: true },
                    orderBy: { achievedAt: 'desc' },
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'Portfolio not found for this username.' });
            return;
        }
        const portfolio = {
            user: {
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                college: user.college,
                location: user.location,
                department: user.department,
                year: user.year,
                trustScore: user.trustScore,
                points: user.points,
                finalScore: user.finalScore,
                currentRank: user.currentRank,
                winsCount: user.winsCount,
                githubUrl: user.githubUrl,
                linkedinUrl: user.linkedinUrl,
                twitterUrl: user.twitterUrl,
                portfolioUrl: user.portfolioUrl,
                devpostUrl: user.devpostUrl,
                email: user.privacySettings?.emailVisibility ? user.email : null,
            },
            skills: user.skills,
            projects: user.projects,
            badges: user.badges,
            milestones: user.milestones,
        };
        res.json({ portfolio });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch public portfolio: ' + err.message });
    }
});
exports.default = router;
