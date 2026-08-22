import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { DevpostSyncService } from '../services/DevpostSyncService';

const router = Router();
const prisma = new PrismaClient();

// 1. GET ALL PLATFORM INTEGRATIONS STATUS
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const platforms = ['DEVPOST', 'GITHUB', 'UNSTOP', 'HACKEREARTH', 'LINKEDIN', 'GOOGLE_DRIVE'];

    const userIntegrations = await prisma.integration.findMany({
      where: { userId },
    });

    const integrationMap = new Map(userIntegrations.map((i) => [i.platform, i]));

    const results = platforms.map((platform) => {
      const item = integrationMap.get(platform);
      return {
        platform,
        isConnected: item ? item.isConnected : false,
        profileUrl: item ? item.profileUrl : null,
        externalUsername: item ? item.externalUsername : null,
        lastSyncedAt: item ? item.lastSyncedAt : null,
        syncedProjectsCount: item ? item.syncedProjectsCount : 0,
        metadata: item && item.metadata ? JSON.parse(item.metadata) : null,
      };
    });

    res.json({ integrations: results });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch integrations.' });
  }
});

// 2. LINK & SYNC DEVPOST
router.post('/devpost/sync', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { devpostUrl } = req.body;
    const userId = req.user.id;

    if (!devpostUrl || typeof devpostUrl !== 'string' || !devpostUrl.trim()) {
      res.status(400).json({ error: 'Devpost profile URL is required.' });
      return;
    }

    const result = await DevpostSyncService.syncDevpostProfile(userId, devpostUrl.trim());
    res.json({
      message: `Devpost profile linked and ${result.syncedCount} projects synced!`,
      result,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Devpost sync failed: ' + err.message });
  }
});

// 3. UNLINK DEVPOST
router.post('/devpost/unlink', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    await prisma.integration.deleteMany({
      where: { userId, platform: 'DEVPOST' },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { devpostUrl: null },
    });
    res.json({ message: 'Devpost profile disconnected.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to disconnect Devpost.' });
  }
});

// 4. LINK & SYNC GITHUB
router.post('/github/sync', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { githubUsername } = req.body;
    const userId = req.user.id;

    if (!githubUsername || typeof githubUsername !== 'string' || !githubUsername.trim()) {
      res.status(400).json({ error: 'GitHub username is required.' });
      return;
    }

    const result = await DevpostSyncService.syncGitHubProfile(userId, githubUsername.trim());
    res.json({
      message: 'GitHub profile connected and repository metrics synced!',
      result,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'GitHub sync failed: ' + err.message });
  }
});

// 5. UNLINK GITHUB
router.post('/github/unlink', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    await prisma.integration.deleteMany({
      where: { userId, platform: 'GITHUB' },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { githubUrl: null },
    });
    res.json({ message: 'GitHub account disconnected.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to disconnect GitHub.' });
  }
});

// 6. TOGGLE OTHER INTEGRATIONS
router.post('/:platform/toggle', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const platform = req.params.platform as string;
    const { profileUrl } = req.body;
    const userId = req.user.id;

    const upperPlatform = String(platform).toUpperCase();

    const existing = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: upperPlatform,
        },
      },
    });

    if (existing && existing.isConnected) {
      await prisma.integration.delete({ where: { id: existing.id } });
      res.json({ isConnected: false, message: `${upperPlatform} integration disconnected.` });
    } else {
      await prisma.integration.upsert({
        where: {
          userId_platform: {
            userId,
            platform: upperPlatform,
          },
        },
        create: {
          userId,
          platform: upperPlatform,
          isConnected: true,
          profileUrl: profileUrl || null,
          lastSyncedAt: new Date(),
        },
        update: {
          isConnected: true,
          profileUrl: profileUrl || null,
          lastSyncedAt: new Date(),
        },
      });
      res.json({ isConnected: true, message: `${upperPlatform} integration successfully connected!` });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update integration.' });
  }
});

export default router;
