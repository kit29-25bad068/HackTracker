"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. INDIVIDUAL LEADERBOARD
router.get('/individual', auth_1.optionalAuth, async (req, res) => {
    try {
        const { department, timePeriod, // all, month, year
        sortBy = 'finalScore', // finalScore, points, trustScore, wins
        search, page = '1', limit = '25', } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 25));
        const skip = (pageNum - 1) * limitNum;
        const where = { isDeleted: false };
        if (department && department !== 'All') {
            where.department = department;
        }
        if (search && typeof search === 'string' && search.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q } },
                { username: { contains: q } },
                { college: { contains: q } },
            ];
        }
        let orderBy = [{ finalScore: 'desc' }, { trustScore: 'desc' }, { points: 'desc' }];
        if (sortBy === 'points') {
            orderBy = [{ points: 'desc' }, { finalScore: 'desc' }];
        }
        else if (sortBy === 'trustScore') {
            orderBy = [{ trustScore: 'desc' }, { finalScore: 'desc' }];
        }
        else if (sortBy === 'wins') {
            orderBy = [{ winsCount: 'desc' }, { finalScore: 'desc' }];
        }
        const total = await prisma.user.count({ where });
        const users = await prisma.user.findMany({
            where,
            skip,
            take: limitNum,
            orderBy,
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                department: true,
                year: true,
                college: true,
                points: true,
                trustScore: true,
                finalScore: true,
                currentRank: true,
                rankChange: true,
                winsCount: true,
                _count: {
                    select: {
                        projects: true,
                        badges: true,
                    },
                },
            },
        });
        // Check current logged in user's position
        let currentUserPosition = null;
        if (req.user) {
            currentUserPosition = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true,
                    department: true,
                    points: true,
                    trustScore: true,
                    finalScore: true,
                    currentRank: true,
                    rankChange: true,
                    winsCount: true,
                },
            });
        }
        res.json({
            leaderboard: users,
            currentUserPosition,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch individual leaderboard: ' + err.message });
    }
});
// 2. TEAM LEADERBOARD
router.get('/teams', auth_1.optionalAuth, async (req, res) => {
    try {
        const { department, sortBy = 'points', page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (department && department !== 'All') {
            where.department = department;
        }
        let orderBy = { totalPoints: 'desc' };
        if (sortBy === 'trust') {
            orderBy = { averageTrust: 'desc' };
        }
        else if (sortBy === 'wins') {
            orderBy = { winsCount: 'desc' };
        }
        const total = await prisma.team.count({ where });
        const teams = await prisma.team.findMany({
            where,
            skip,
            take: limitNum,
            orderBy,
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
                _count: {
                    select: { projects: true },
                },
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
        res.status(500).json({ error: 'Failed to fetch team leaderboard: ' + err.message });
    }
});
// 3. DEPARTMENT LEADERBOARD & ANALYTICS
router.get('/departments', async (req, res) => {
    try {
        const departments = ['CSE', 'ECE', 'IT', 'AI & DS', 'Others'];
        const departmentStats = [];
        for (const dept of departments) {
            const activeStudents = await prisma.user.count({ where: { department: dept, isDeleted: false } });
            const projects = await prisma.project.count({
                where: { user: { department: dept } },
            });
            const wins = await prisma.project.count({
                where: { user: { department: dept }, status: 'Winner' },
            });
            const users = await prisma.user.findMany({
                where: { department: dept, isDeleted: false },
                select: { trustScore: true, points: true },
            });
            const avgTrust = users.length > 0
                ? parseFloat((users.reduce((acc, u) => acc + u.trustScore, 0) / users.length).toFixed(1))
                : 50.0;
            const topStudents = await prisma.user.findMany({
                where: { department: dept, isDeleted: false },
                orderBy: { finalScore: 'desc' },
                take: 3,
                select: { id: true, name: true, username: true, avatar: true, finalScore: true, trustScore: true },
            });
            const topTeams = await prisma.team.findMany({
                where: { department: dept },
                orderBy: { totalPoints: 'desc' },
                take: 3,
                select: { id: true, name: true, logoUrl: true, totalPoints: true, averageTrust: true },
            });
            departmentStats.push({
                department: dept,
                activeStudents,
                projects,
                wins,
                averageTrust: avgTrust,
                topStudents,
                topTeams,
            });
        }
        res.json({ departmentStats });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch department statistics.' });
    }
});
// 4. CSV EXPORT FOR LEADERBOARD
router.get('/export/csv', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { isDeleted: false },
            orderBy: { finalScore: 'desc' },
            select: {
                currentRank: true,
                name: true,
                username: true,
                email: true,
                department: true,
                year: true,
                college: true,
                points: true,
                trustScore: true,
                finalScore: true,
                winsCount: true,
            },
        });
        let csv = 'Rank,Name,Username,Department,Year,College,Points,TrustScore,FinalScore,Wins\n';
        for (const u of users) {
            csv += `"${u.currentRank}","${u.name}","${u.username}","${u.department}","${u.year}","${u.college || ''}","${u.points}","${u.trustScore}%","${u.finalScore}","${u.winsCount}"\n`;
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="hacktracker_leaderboard.csv"');
        res.send(csv);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to generate CSV export.' });
    }
});
exports.default = router;
