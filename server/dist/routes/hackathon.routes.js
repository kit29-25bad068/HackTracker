"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const ApifyUnstopSyncService_1 = require("../services/ApifyUnstopSyncService");
const ApifyHackathonAggregatorService_1 = require("../services/ApifyHackathonAggregatorService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 0. 6-PLATFORM APIFY HACKATHON AGGREGATOR (aurumworks/hackathon-aggregator)
router.post('/sync-all', async (req, res) => {
    try {
        const { token, forceFreshRun } = req.body;
        const result = await ApifyHackathonAggregatorService_1.ApifyHackathonAggregatorService.syncAllPlatforms(token, forceFreshRun);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to aggregate hackathons: ' + err.message });
    }
});
router.post('/purge-synthetic', async (_req, res) => {
    try {
        const purged = await ApifyHackathonAggregatorService_1.ApifyHackathonAggregatorService.purgeSyntheticHackathons();
        res.json({ success: true, purgedCount: purged, message: `Successfully purged ${purged} synthetic hackathons.` });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to purge synthetic hackathons: ' + err.message });
    }
});
router.post('/sync-unstop', async (req, res) => {
    try {
        const { token } = req.body;
        const result = await ApifyUnstopSyncService_1.ApifyUnstopSyncService.syncLiveUnstopHackathons(token);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to sync Unstop hackathons: ' + err.message });
    }
});
router.get('/sync-status', async (_req, res) => {
    try {
        const [devpost, mlh, dorahacks, devfolio, unstop, total] = await Promise.all([
            prisma.hackathon.count({ where: { platform: 'Devpost' } }),
            prisma.hackathon.count({ where: { platform: 'MLH' } }),
            prisma.hackathon.count({ where: { platform: 'DoraHacks' } }),
            prisma.hackathon.count({ where: { platform: 'Devfolio' } }),
            prisma.hackathon.count({ where: { platform: 'Unstop' } }),
            prisma.hackathon.count(),
        ]);
        res.json({
            hasApifyToken: !!(process.env.APIFY_API_TOKEN || 'apify_api_LsL1kWSh2sxL5xzRHMVBQWEFFJaDM04bNdkp'),
            platforms: {
                Devpost: devpost,
                Unstop: unstop,
                DoraHacks: dorahacks,
                Devfolio: devfolio,
                MLH: mlh
            },
            totalCount: total,
            lastSync: new Date().toISOString()
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch sync status: ' + err.message });
    }
});
// 1. LIST HACKATHONS
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { search, platform, locationType, theme, duration, difficulty, department, dateStatus, minPrize, maxPrize, page = '1', limit = '12', sortBy = 'date', } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (search && typeof search === 'string' && search.trim() !== '') {
            const q = search.trim();
            where.OR = [
                { title: { contains: q } },
                { description: { contains: q } },
                { theme: { contains: q } },
                { platform: { contains: q } },
            ];
        }
        if (platform && typeof platform === 'string' && platform !== 'All') {
            where.platform = platform;
        }
        if (locationType && typeof locationType === 'string' && locationType !== 'All') {
            where.locationType = locationType;
        }
        if (theme && typeof theme === 'string' && theme !== 'All') {
            where.theme = theme;
        }
        if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
            where.difficulty = difficulty;
        }
        if (department && typeof department === 'string' && department !== 'All') {
            where.department = department;
        }
        if (duration && typeof duration === 'string' && duration !== 'All') {
            where.duration = duration;
        }
        const now = new Date();
        if (dateStatus === 'upcoming') {
            where.endDate = { gte: now };
        }
        else if (dateStatus === 'past') {
            where.endDate = { lt: now };
        }
        if (minPrize || maxPrize) {
            where.prizePoolValue = {};
            if (minPrize)
                where.prizePoolValue.gte = parseInt(minPrize);
            if (maxPrize)
                where.prizePoolValue.lte = parseInt(maxPrize);
        }
        let orderBy = { startDate: 'asc' };
        if (sortBy === 'prize') {
            orderBy = { prizePoolValue: 'desc' };
        }
        else if (sortBy === 'rating') {
            orderBy = { rating: 'desc' };
        }
        else if (sortBy === 'participants') {
            orderBy = { participantCount: 'desc' };
        }
        else if (sortBy === 'deadline') {
            orderBy = { registrationDeadline: 'asc' };
        }
        const total = await prisma.hackathon.count({ where });
        const hackathons = await prisma.hackathon.findMany({
            where,
            skip,
            take: limitNum,
            orderBy,
            include: {
                _count: {
                    select: { reviews: true, projects: true },
                },
            },
        });
        let savedHackathonIds = new Set();
        if (req.user) {
            const saved = await prisma.savedHackathon.findMany({
                where: { userId: req.user.id },
                select: { hackathonId: true },
            });
            savedHackathonIds = new Set(saved.map((s) => s.hackathonId));
        }
        const enriched = hackathons.map((h) => ({
            ...h,
            isSaved: savedHackathonIds.has(h.id),
        }));
        res.json({
            hackathons: enriched,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch hackathons: ' + err.message });
    }
});
// 2. FEATURED HACKATHONS
router.get('/featured', auth_1.optionalAuth, async (req, res) => {
    try {
        const featured = await prisma.hackathon.findMany({
            where: { isFeatured: true },
            take: 6,
            orderBy: { startDate: 'asc' },
        });
        res.json({ hackathons: featured });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch featured hackathons.' });
    }
});
// 3. GET DETAILS & SIMILAR
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const hackathon = await prisma.hackathon.findFirst({
            where: {
                OR: [{ id }, { slug: id }],
            },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: { id: true, name: true, username: true, avatar: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { projects: true, savedBy: true },
                },
            },
        });
        if (!hackathon) {
            res.status(404).json({ error: 'Hackathon not found.' });
            return;
        }
        let isSaved = false;
        if (req.user) {
            const saved = await prisma.savedHackathon.findUnique({
                where: {
                    userId_hackathonId: {
                        userId: req.user.id,
                        hackathonId: hackathon.id,
                    },
                },
            });
            isSaved = !!saved;
        }
        const similar = await prisma.hackathon.findMany({
            where: {
                id: { not: hackathon.id },
                OR: [{ theme: hackathon.theme }, { platform: hackathon.platform }],
            },
            take: 4,
            orderBy: { rating: 'desc' },
        });
        res.json({
            hackathon: {
                ...hackathon,
                isSaved,
            },
            similar,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch hackathon details.' });
    }
});
// 4. SAVE / UNSAVE
router.post('/:id/save', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const hackathon = await prisma.hackathon.findUnique({ where: { id } });
        if (!hackathon) {
            res.status(404).json({ error: 'Hackathon not found.' });
            return;
        }
        const existing = await prisma.savedHackathon.findUnique({
            where: {
                userId_hackathonId: {
                    userId,
                    hackathonId: id,
                },
            },
        });
        if (existing) {
            await prisma.savedHackathon.delete({
                where: { id: existing.id },
            });
            res.json({ isSaved: false, message: 'Hackathon removed from your saved list.' });
        }
        else {
            await prisma.savedHackathon.create({
                data: { userId, hackathonId: id },
            });
            res.json({ isSaved: true, message: 'Hackathon saved to your bookmarks!' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to toggle saved status.' });
    }
});
// 5. REVIEW
router.post('/:id/review', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
            return;
        }
        if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
            res.status(400).json({ error: 'Please write a review comment with at least 5 characters.' });
            return;
        }
        const review = await prisma.hackathonReview.create({
            data: {
                hackathonId: id,
                userId,
                rating: parseInt(rating),
                comment: comment.trim(),
            },
            include: {
                user: {
                    select: { id: true, name: true, username: true, avatar: true },
                },
            },
        });
        const allReviews = await prisma.hackathonReview.findMany({ where: { hackathonId: id } });
        const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        await prisma.hackathon.update({
            where: { id },
            data: { rating: parseFloat(avgRating.toFixed(2)) },
        });
        res.status(201).json({ review, averageRating: avgRating });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to post review.' });
    }
});
exports.default = router;
