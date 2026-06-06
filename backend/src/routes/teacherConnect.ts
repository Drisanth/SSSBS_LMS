import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// Helper to detect resource type
function detectResourceType(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'YOUTUBE';
  if (lowerUrl.includes('drive.google.com')) return 'DRIVE';
  if (lowerUrl.endsWith('.pdf')) return 'PDF';
  if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return 'IMAGE';
  if (lowerUrl.match(/\.(mp4|webm|ogg)$/i)) return 'VIDEO';
  return 'WEBSITE';
}

// 1. Generate Transfer Code (Protected)
router.post('/generate-code', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Generate an 8-character secure random code
    const rawBytes = crypto.randomBytes(4);
    const codeSegment1 = rawBytes.toString('hex').slice(0, 4).toUpperCase();
    const codeSegment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const transferCode = `${codeSegment1}-${codeSegment2}`;

    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const session = await prisma.teacherConnectSession.create({
      data: {
        teacherId: req.user.userId,
        transferCode,
        expiresAt
      }
    });

    res.status(201).json({
      transferCode: session.transferCode,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Failed to generate code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Verify Transfer Code (Public)
router.get('/verify-code/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const session = await prisma.teacherConnectSession.findUnique({
      where: { transferCode: code },
      include: {
        teacher: {
          select: { name: true }
        }
      }
    });

    if (!session || !session.isActive) {
      return res.status(404).json({ valid: false, error: 'Invalid or inactive transfer code' });
    }

    if (session.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, error: 'Transfer code has expired' });
    }

    res.json({
      valid: true,
      teacherName: session.teacher.name,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Submit Resource (Public)
router.post('/submit-resource', async (req, res) => {
  const { code, resourceUrl, title, notes } = req.body;

  if (!code || !resourceUrl) {
    return res.status(400).json({ error: 'Transfer code and URL are required' });
  }

  try {
    const session = await prisma.teacherConnectSession.findUnique({
      where: { transferCode: code }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Transfer code is invalid or expired' });
    }

    const resourceType = detectResourceType(resourceUrl);

    const resource = await prisma.teacherConnectResource.create({
      data: {
        teacherId: session.teacherId,
        title: title || 'Untitled Resource',
        notes: notes || '',
        resourceUrl,
        resourceType,
        status: 'inbox'
      }
    });

    res.status(201).json({ success: true, resourceId: resource.id });
  } catch (error) {
    console.error('Submit resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Get Teacher's Inbox/Resources (Protected)
router.get('/inbox', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const resources = await prisma.teacherConnectResource.findMany({
      where: { 
        teacherId: req.user.userId,
        status: { not: 'deleted' }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(resources);
  } catch (error) {
    console.error('Fetch inbox error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Update Resource Status/Info (Protected)
router.put('/resources/:id', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const updateData = req.body;

  try {
    const resource = await prisma.teacherConnectResource.findUnique({
      where: { id: String(id) }
    });

    if (!resource || resource.teacherId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized or not found' });
    }

    const updated = await prisma.teacherConnectResource.update({
      where: { id: String(id) },
      data: updateData
    });

    res.json(updated);
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
