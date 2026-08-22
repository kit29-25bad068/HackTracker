"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!decoded || !decoded.userId) {
            res.status(401).json({ error: 'Invalid or expired session token.' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                privacySettings: true,
            },
        });
        if (!user || user.isDeleted) {
            res.status(401).json({ error: 'User account not found or deleted.' });
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Authentication failed. ' + err.message });
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            if (decoded && decoded.userId) {
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                });
                if (user && !user.isDeleted) {
                    req.user = user;
                    req.token = token;
                }
            }
        }
    }
    catch (e) {
        // Ignore error for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
