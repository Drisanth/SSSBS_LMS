import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { sendWelcomeEmail } from '../utils/email';

const router = Router();

// Only ADMIN can access these routes
router.use(authenticateToken, requireRole(['ADMIN']));

// Get all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        teacherProfile: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new teacher
router.post('/', async (req, res) => {
  const { username, name, password, email, phone, subjects, grades } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await prisma.user.create({
      data: {
        username,
        name,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role: 'TEACHER',
        teacherProfile: {
          create: {
            subjects: subjects || '',
            grades: grades || ''
          }
        }
      },
      include: { teacherProfile: true }
    });

    // Send Welcome Email if email is provided
    if (email) {
      // Fire and forget (don't await so we don't block the API response unnecessarily)
      sendWelcomeEmail(email, name, username, subjects || '', grades || '');
    }

    // Don't send password back
    const { password: _, ...teacherData } = newTeacher;
    res.status(201).json(teacherData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update teacher status (Disable/Enable) or details
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status, subjects, grades } = req.body;

  try {
    const teacher = await prisma.user.findUnique({
      where: { id, role: 'TEACHER' }
    });

    if (!teacher) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : teacher.name,
        email: email !== undefined ? email : teacher.email,
        phone: phone !== undefined ? phone : teacher.phone,
        status: status !== undefined ? status : teacher.status,
        teacherProfile: {
          update: {
            subjects: subjects !== undefined ? subjects : undefined,
            grades: grades !== undefined ? grades : undefined
          }
        }
      },
      include: { teacherProfile: true }
    });

    const { password: _, ...teacherData } = updatedUser;
    res.json(teacherData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Hard Delete teacher (Delete profile, sessions, reassign materials to Admin)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const adminId = (req as any).user?.userId; // Assuming authenticateToken sets req.user

  try {
    // 1. Reassign materials to the Admin so the school doesn't lose them
    if (adminId) {
      await prisma.material.updateMany({
        where: { uploaderId: id },
        data: { uploaderId: adminId }
      });
    }

    // 2. Delete all related records in a transaction
    await prisma.$transaction([
      prisma.teacherProfile.deleteMany({ where: { userId: id } }),
      prisma.teacherConnectResource.deleteMany({ where: { teacherId: id } }),
      prisma.teacherConnectSession.deleteMany({ where: { teacherId: id } }),
      prisma.reviewComment.deleteMany({ where: { authorId: id } }),
      prisma.user.delete({ where: { id, role: 'TEACHER' } })
    ]);

    res.json({ message: 'Teacher and associated records deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
