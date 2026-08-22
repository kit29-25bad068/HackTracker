import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

    const decoded: any = jwt.verify(token, jwtSecret);
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
  } catch (err: any) {
    res.status(401).json({ error: 'Authentication failed. ' + err.message });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded: any = jwt.verify(token, jwtSecret);
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
  } catch (e) {
    // Ignore error for optional auth
  }
  next();
};
