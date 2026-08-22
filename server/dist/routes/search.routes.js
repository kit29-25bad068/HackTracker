"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. GLOBAL MULTI-INDEX SEARCH
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q || typeof q !== 'string' || !q.trim()) {
            res.json({
                users: [],
                projects: [],
                hackathons: [],
                skills: [],
            });
            return;
        }
        const query = q.trim();
        if (req.user) {
            await prisma.searchHistory.create({
                data: {
                    userId: req.user.id,
                    query,
                },
            });
        }
        const shouldSearchUsers = !type || type === 'all' || type === 'users';
        const shouldSearchProjects = !type || type === 'all' || type === 'projects';
        const shouldSearchHackathons = !type || type === 'all' || type === 'hackathons';
        const shouldSearchSkills = !type || type === 'all' || type === 'skills';
        const [users, projects, hackathons, skills] = await Promise.all([
            shouldSearchUsers
                ? prisma.user.findMany({
                    where: {
                        isDeleted: false,
                        OR: [
                            { name: { contains: query } },
                            { username: { contains: query } },
                            { department: { contains: query } },
                            { college: { contains: query } },
                        ],
                    },
                    take: 6,
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        department: true,
                        trustScore: true,
                        points: true,
                        currentRank: true,
                    },
                })
                : [],
            shouldSearchProjects
                ? prisma.project.findMany({
                    where: {
                        OR: [
                            { title: { contains: query } },
                            { description: { contains: query } },
                            { techStack: { contains: query } },
                        ],
                    },
                    take: 6,
                    include: {
                        user: { select: { name: true, username: true, avatar: true } },
                        hackathon: { select: { title: true, platform: true } },
                    },
                })
                : [],
            shouldSearchHackathons
                ? prisma.hackathon.findMany({
                    where: {
                        OR: [
                            { title: { contains: query } },
                            { platform: { contains: query } },
                            { theme: { contains: query } },
                            { description: { contains: query } },
                        ],
                    },
                    take: 6,
                })
                : [],
            shouldSearchSkills
                ? prisma.skill.findMany({
                    where: {
                        name: { contains: query },
                    },
                    take: 8,
                    include: {
                        _count: { select: { userSkills: true } },
                    },
                })
                : [],
        ]);
        res.json({
            query,
            results: {
                users,
                projects,
                hackathons,
                skills,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Search failed: ' + err.message });
    }
});
// 2. RECENT SEARCHES
router.get('/recent', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const recents = await prisma.searchHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        const uniqueQueries = Array.from(new Set(recents.map((r) => r.query)));
        res.json({ recentSearches: uniqueQueries });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch search history.' });
    }
});
// 3. CLEAR SEARCH HISTORY
router.delete('/recent', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.searchHistory.deleteMany({ where: { userId } });
        res.json({ message: 'Search history cleared.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to clear search history.' });
    }
});
// 4. GET SAVED SEARCHES
router.get('/saved', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const saved = await prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ savedSearches: saved });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch saved searches.' });
    }
});
// 5. CREATE SAVED SEARCH
router.post('/saved', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { query, filters, alertOnNew = false } = req.body;
        if (!query || typeof query !== 'string' || !query.trim()) {
            res.status(400).json({ error: 'Query is required to save search.' });
            return;
        }
        const saved = await prisma.savedSearch.create({
            data: {
                userId,
                query: query.trim(),
                filters: typeof filters === 'object' ? JSON.stringify(filters) : filters || null,
                alertOnNew: alertOnNew === true,
            },
        });
        res.status(201).json({ message: 'Search query saved!', savedSearch: saved });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to save search.' });
    }
});
// 6. DELETE SAVED SEARCH
router.delete('/saved/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        await prisma.savedSearch.deleteMany({
            where: { id, userId },
        });
        res.json({ message: 'Saved search deleted.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete saved search.' });
    }
});
exports.default = router;
