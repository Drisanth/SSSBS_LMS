import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import materialRoutes from './routes/materials';
import teacherRoutes from './routes/teachers';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/teachers', teacherRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SSSBS LMS API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
