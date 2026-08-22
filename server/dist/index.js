"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const hackathon_routes_1 = __importDefault(require("./routes/hackathon.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const skill_routes_1 = __importDefault(require("./routes/skill.routes"));
const badge_routes_1 = __importDefault(require("./routes/badge.routes"));
const milestone_routes_1 = __importDefault(require("./routes/milestone.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const security_routes_1 = __importDefault(require("./routes/security.routes"));
const privacy_routes_1 = __importDefault(require("./routes/privacy.routes"));
const integration_routes_1 = __importDefault(require("./routes/integration.routes"));
const ApifyHackathonAggregatorService_1 = require("./services/ApifyHackathonAggregatorService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
// Initialize Automated Daily Midnight Sync Cron Cycle (00:00:00)
ApifyHackathonAggregatorService_1.ApifyHackathonAggregatorService.initCronSync();
// Middleware
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), service: 'HackTracker API' });
});
// Platform Global Stats (for Home Hero & Stats section)
app.get('/api/stats', async (req, res) => {
    try {
        const [activeUsers, hackathonsTracked, projectsSubmitted, allUsers, popularSkills,] = await Promise.all([
            prisma.user.count({ where: { isDeleted: false } }),
            prisma.hackathon.count(),
            prisma.project.count(),
            prisma.user.findMany({
                where: { isDeleted: false },
                select: { trustScore: true },
            }),
            prisma.skill.findMany({
                take: 6,
                include: { _count: { select: { userSkills: true } } },
                orderBy: { userSkills: { _count: 'desc' } },
            }),
        ]);
        const avgTrust = allUsers.length > 0
            ? parseFloat((allUsers.reduce((acc, u) => acc + u.trustScore, 0) / allUsers.length).toFixed(1))
            : 50.0;
        res.json({
            activeUsers: Math.max(activeUsers, 1280), // seeded + platform base
            hackathonsTracked: Math.max(hackathonsTracked, 450),
            projectsSubmitted: Math.max(projectsSubmitted, 890),
            averageTrustScore: avgTrust,
            popularSkills: popularSkills.map((s) => ({
                name: s.name,
                category: s.category,
                count: s._count.userSkills,
            })),
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch platform stats.' });
    }
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/hackathons', hackathon_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/skills', skill_routes_1.default);
app.use('/api/badges', badge_routes_1.default);
app.use('/api/milestones', milestone_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/security', security_routes_1.default);
app.use('/api/privacy', privacy_routes_1.default);
app.use('/api/integrations', integration_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error occurred.',
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 HackTracker API Server running on port http://localhost:${PORT}`);
});
