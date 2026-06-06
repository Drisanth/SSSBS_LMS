import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: Get all materials with filters
router.get('/', async (req, res) => {
  const { grade, subject, teacherId, search } = req.query;

  const where: any = { isDeleted: false, status: 'ACTIVE' };

  if (grade) where.grade = String(grade);
  if (subject) where.subject = String(subject);
  if (teacherId) where.uploaderId = String(teacherId);

  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { description: { contains: String(search) } },
      { chapterName: { contains: String(search) } },
      { uploader: { name: { contains: String(search) } } }
    ];
  }

  try {
    const materials = await prisma.material.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(materials);
  } catch (error) {
    console.error('Fetch materials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected (TEACHER/ADMIN): Upload new material
router.post('/', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  const { title, description, academicYear, grade, subject, chapterNo, chapterName, type, urlOrPath } = req.body;
  
  if (!req.user) return; // handled by middleware

  try {
    const material = await prisma.material.create({
      data: {
        title,
        description,
        academicYear,
        grade,
        subject,
        chapterNo: Number(chapterNo),
        chapterName,
        type,
        urlOrPath,
        uploaderId: req.user.userId
      }
    });
    res.status(201).json(material);
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected (TEACHER/ADMIN): Update material (versioning)
router.put('/:id', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { createNewVersion, ...updateData } = req.body;
  
  if (!req.user) return;

  try {
    const existing = await prisma.material.findUnique({ where: { id: String(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    // Authorization check
    if (req.user.role === 'TEACHER' && existing.uploaderId !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized to edit this material' });
      return;
    }

    if (createNewVersion) {
      // Archive old version
      await prisma.material.update({
        where: { id: String(id) },
        data: { status: 'ARCHIVED' }
      });

      // Create new version
      const newMaterial = await prisma.material.create({
        data: {
          ...existing,
          ...updateData,
          id: undefined, // Let prisma generate a new UUID
          version: existing.version + 1,
          status: 'ACTIVE',
          createdAt: undefined,
          updatedAt: undefined
        }
      });
      res.json(newMaterial);
    } else {
      // In-place update
      const updated = await prisma.material.update({
        where: { id: String(id) },
        data: updateData
      });
      res.json(updated);
    }
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected (TEACHER/ADMIN): Delete material
router.delete('/:id', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (!req.user) return;

  try {
    const existing = await prisma.material.findUnique({ where: { id: String(id) } });
    if (!existing) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    // Authorization check
    if (req.user.role === 'TEACHER' && existing.uploaderId !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized to delete this material' });
      return;
    }

    // Soft delete
    await prisma.material.update({
      where: { id: String(id) },
      data: { isDeleted: true }
    });

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN ONLY: Add Review Comment
router.post('/:id/reviews', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!req.user) return;

  try {
    const comment = await prisma.reviewComment.create({
      data: {
        content,
        materialId: String(id),
        authorId: req.user.userId
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TEACHER/ADMIN: Get Review Comments
router.get('/:id/reviews', authenticateToken, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  
  try {
    const comments = await prisma.reviewComment.findMany({
      where: { materialId: String(id) },
      include: {
        author: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
