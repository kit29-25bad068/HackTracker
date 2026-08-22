import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { TesseractOcrService } from '../services/TesseractOcrService';
import { TrustScoreService } from '../services/TrustScoreService';
import { BadgeEngine } from '../services/BadgeEngine';
import { MilestoneEngine } from '../services/MilestoneEngine';
import { NotificationService } from '../services/NotificationService';

const router = Router();
const prisma = new PrismaClient();

// 1. LIST PROJECTS
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, status, verifiedOnly, search, limit = '20', page = '1' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (userId && typeof userId === 'string') {
      where.userId = userId;
    }

    if (status && typeof status === 'string' && status !== 'All') {
      where.status = status;
    }

    if (verifiedOnly === 'true') {
      where.isVerified = true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { techStack: { contains: q } },
      ];
    }

    const total = await prisma.project.count({ where });
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true, department: true, trustScore: true },
        },
        hackathon: {
          select: { id: true, title: true, platform: true, logoUrl: true },
        },
        team: {
          select: { id: true, name: true, logoUrl: true },
        },
        certificate: true,
      },
    });

    res.json({
      projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch projects: ' + err.message });
  }
});

// 2. GET SINGLE PROJECT
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id },
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
            githubUrl: true,
            linkedinUrl: true,
          },
        },
        hackathon: true,
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, username: true, avatar: true },
                },
              },
            },
          },
        },
        certificate: true,
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    await prisma.project.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ project });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch project details.' });
  }
});

// 3. CREATE PROJECT
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      tagline,
      description,
      hackathonId,
      hackathonCustomName,
      projectUrl,
      githubUrl,
      techStack,
      isSolo = true,
      teamId,
      status = 'Submitted',
    } = req.body;

    if (!title || !title.trim() || !description || !description.trim()) {
      res.status(400).json({ error: 'Project title and description are required.' });
      return;
    }

    if (!githubUrl || !githubUrl.trim()) {
      res.status(400).json({ error: 'GitHub Repository URL is mandatory. Please provide your repository link.' });
      return;
    }

    const cleanGithubUrl = githubUrl.trim();
    if (!cleanGithubUrl.toLowerCase().includes('github.com')) {
      res.status(400).json({ error: 'Please enter a valid GitHub repository link (e.g. https://github.com/username/repository).' });
      return;
    }

    const formattedTechStack = Array.isArray(techStack)
      ? JSON.stringify(techStack)
      : typeof techStack === 'string'
      ? techStack.startsWith('[')
        ? techStack
        : JSON.stringify(techStack.split(',').map((t) => t.trim()))
      : JSON.stringify([]);

    const project = await prisma.project.create({
      data: {
        userId: req.user.id,
        hackathonId: hackathonId || null,
        hackathonCustomName: hackathonCustomName || null,
        title: title.trim(),
        tagline: tagline ? tagline.trim() : null,
        description: description.trim(),
        projectUrl: projectUrl ? projectUrl.trim() : null,
        githubUrl: githubUrl ? githubUrl.trim() : null,
        techStack: formattedTechStack,
        isSolo: isSolo === true || isSolo === 'true',
        teamId: teamId || null,
        status: status || 'Submitted',
        isVerified: false,
      },
      include: {
        hackathon: true,
        team: true,
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });

    await TrustScoreService.recalculateUserScore(req.user.id);
    const unlockedBadges = await BadgeEngine.evaluateBadges(req.user.id);
    const achievedMilestones = await MilestoneEngine.evaluateMilestones(req.user.id);

    res.status(201).json({
      message: 'Project created successfully!',
      project,
      unlockedBadges,
      achievedMilestones,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

// 4. UPDATE PROJECT
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    if (project.userId !== req.user.id) {
      res.status(403).json({ error: 'You are not authorized to edit this project.' });
      return;
    }

    const {
      title,
      tagline,
      description,
      hackathonId,
      hackathonCustomName,
      projectUrl,
      githubUrl,
      techStack,
      isSolo,
      teamId,
      status,
    } = req.body;

    if (githubUrl !== undefined) {
      if (!githubUrl || !githubUrl.trim()) {
        res.status(400).json({ error: 'GitHub Repository URL cannot be empty.' });
        return;
      }
      if (!githubUrl.toLowerCase().includes('github.com')) {
        res.status(400).json({ error: 'Please enter a valid GitHub repository link (e.g. https://github.com/username/repository).' });
        return;
      }
    }

    const formattedTechStack = techStack
      ? Array.isArray(techStack)
        ? JSON.stringify(techStack)
        : typeof techStack === 'string' && techStack.startsWith('[')
        ? techStack
        : JSON.stringify(typeof techStack === 'string' ? techStack.split(',').map((t) => t.trim()) : [])
      : project.techStack;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : project.title,
        tagline: tagline !== undefined ? (tagline ? tagline.trim() : null) : project.tagline,
        description: description !== undefined ? description.trim() : project.description,
        hackathonId: hackathonId !== undefined ? (hackathonId || null) : project.hackathonId,
        hackathonCustomName: hackathonCustomName !== undefined ? hackathonCustomName : project.hackathonCustomName,
        projectUrl: projectUrl !== undefined ? (projectUrl ? projectUrl.trim() : null) : project.projectUrl,
        githubUrl: githubUrl !== undefined ? (githubUrl ? githubUrl.trim() : null) : project.githubUrl,
        techStack: formattedTechStack,
        isSolo: isSolo !== undefined ? (isSolo === true || isSolo === 'true') : project.isSolo,
        teamId: teamId !== undefined ? (teamId || null) : project.teamId,
        status: status !== undefined ? status : project.status,
      },
    });

    await TrustScoreService.recalculateUserScore(req.user.id);
    await BadgeEngine.evaluateBadges(req.user.id);

    res.json({ message: 'Project updated successfully.', project: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// 5. DELETE PROJECT
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    if (project.userId !== req.user.id) {
      res.status(403).json({ error: 'You are not authorized to delete this project.' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    await TrustScoreService.recalculateUserScore(req.user.id);

    res.json({ message: 'Project deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// 6. CERTIFICATE OCR UPLOAD
router.post(
  '/:id/certificate',
  requireAuth,
  upload.single('certificate'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const file = req.file;
      const user = req.user;

      if (!file) {
        res.status(400).json({ error: 'Please select a certificate image (PNG/JPG) or PDF to upload.' });
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id },
        include: { hackathon: true },
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      if (project.userId !== user.id) {
        res.status(403).json({ error: 'Unauthorized to upload certificate for this project.' });
        return;
      }

      const fileRelativeUrl = `/uploads/certificates/${file.filename}`;
      const absoluteFilePath = path.join(process.cwd(), 'uploads', 'certificates', file.filename);

      const hackathonName = project.hackathon ? project.hackathon.title : project.hackathonCustomName || project.title;

      const ocrResult = await TesseractOcrService.processCertificate(
        absoluteFilePath,
        user.name,
        hackathonName
      );

      const isVerified = ocrResult.status === 'VERIFIED';

      await prisma.certificate.upsert({
        where: { projectId: project.id },
        create: {
          projectId: project.id,
          userId: user.id,
          fileUrl: fileRelativeUrl,
          rawOcrText: ocrResult.rawText,
          extractedName: ocrResult.extractedName,
          extractedHackathon: ocrResult.extractedHackathon,
          extractedAchievement: ocrResult.extractedAchievement,
          extractedDate: ocrResult.extractedDate,
          confidenceScore: ocrResult.confidenceScore,
          status: ocrResult.status,
          rejectionReason: ocrResult.rejectionReason,
          verifiedAt: isVerified ? new Date() : null,
        },
        update: {
          fileUrl: fileRelativeUrl,
          rawOcrText: ocrResult.rawText,
          extractedName: ocrResult.extractedName,
          extractedHackathon: ocrResult.extractedHackathon,
          extractedAchievement: ocrResult.extractedAchievement,
          extractedDate: ocrResult.extractedDate,
          confidenceScore: ocrResult.confidenceScore,
          status: ocrResult.status,
          rejectionReason: ocrResult.rejectionReason,
          verifiedAt: isVerified ? new Date() : null,
        },
      });

      const updatedProject = await prisma.project.update({
        where: { id: project.id },
        data: {
          certificateUrl: fileRelativeUrl,
          isVerified,
          verificationDate: isVerified ? new Date() : null,
          status: isVerified && ocrResult.extractedAchievement?.toLowerCase().includes('winner') ? 'Winner' : project.status,
        },
        include: {
          certificate: true,
          hackathon: true,
          team: true,
        },
      });

      const scoreResult = await TrustScoreService.recalculateUserScore(user.id);
      const unlockedBadges = await BadgeEngine.evaluateBadges(user.id);
      const achievedMilestones = await MilestoneEngine.evaluateMilestones(user.id);

      if (isVerified) {
        await NotificationService.sendNotification({
          userId: user.id,
          type: 'PROJECT_VERIFIED',
          title: 'Certificate Verified via OCR! ✨',
          message: `Your certificate for "${hackathonName}" was verified with ${ocrResult.confidenceScore}% confidence. +8 Trust Score!`,
          link: `/projects/${project.id}`,
          emailCategory: 'PROJECT_VERIFICATION',
          emailSubject: `✅ Certificate Verified: ${hackathonName} (+8 Trust Score)`,
          emailHtml: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #0b0f17; color: #f3f4f6;">
              <h2 style="color: #10b981; margin-bottom: 8px;">Certificate Verified Successfully! 🛡️</h2>
              <p style="font-size: 16px; color: #d1d5db;">Hi ${user.name},</p>
              <p style="font-size: 15px; color: #9ca3af;">Our automated Optical Character Recognition (OCR) engine has authenticated your hackathon certificate:</p>
              <div style="background: #111827; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <p style="margin: 4px 0; color: #fff;"><strong>Project:</strong> ${project.title}</p>
                <p style="margin: 4px 0; color: #fff;"><strong>Hackathon:</strong> ${hackathonName}</p>
                <p style="margin: 4px 0; color: #10b981;"><strong>Achievement:</strong> ${ocrResult.extractedAchievement || 'Verified Participant'}</p>
                <p style="margin: 4px 0; color: #9ca3af;"><strong>OCR Confidence:</strong> ${ocrResult.confidenceScore}%</p>
                <p style="margin: 4px 0; color: #14b8a6; font-weight: bold;">Trust Score Increased: +8% (Current: ${scoreResult.trustScore}%)</p>
              </div>
              <a href="http://localhost:5173/projects/${project.id}" style="display: inline-block; background: #10b981; color: #000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px;">View Verified Project</a>
            </div>
          `,
        });
      }

      res.json({
        message: isVerified ? 'Certificate verified successfully via OCR!' : 'Certificate analysis complete.',
        project: updatedProject,
        ocrResult,
        newScores: scoreResult,
        unlockedBadges,
        achievedMilestones,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'OCR processing failed: ' + err.message });
    }
  }
);

export default router;
