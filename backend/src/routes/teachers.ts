import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

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
  const { username, name, password, subjects, grades } = req.body;

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
  const { name, status, subjects, grades } = req.body;

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

// Soft Delete teacher (Set status to DISABLED and handle cleanup if needed)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.update({
      where: { id, role: 'TEACHER' },
      data: { status: 'DISABLED' } // We don't delete to preserve material references
    });
    res.json({ message: 'Teacher disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
