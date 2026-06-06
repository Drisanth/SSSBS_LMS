# SSSBS LMS

A modern Study Material Repository Platform and Learning Management System designed for schools to manage resources, teachers, and future student integrations.

## Features

- **Public Dashboard**: Browse and filter study materials seamlessly.
- **Teacher Portal**: Upload, edit, and version YouTube/external study links.
- **Admin Panel**: Manage teacher accounts, review materials, and oversee the repository.
- **Modern UI**: Clean, Notion/Linear-inspired interface with responsive design.
- **Future-Ready DB Schema**: Prepared for student enrollment, assignments, and attendance scaling.

## Technology Stack

- **Frontend**: React (Vite), TypeScript, React Router, Custom CSS Design System
- **Backend**: Node.js, Express, Prisma ORM, JWT Authentication
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (e.g., Supabase)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your database connection strings and JWT secret (see `.env.example`).
4. Initialize the database and seed the default Admin user:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Default Credentials
After running the seed script, log in with:
- **Username**: `admin`
- **Password**: `admin123`
*(Make sure to change this upon first login!)*

## Deployment

### Vercel (Frontend)
The frontend is optimized for zero-config Vercel deployment:
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` folder as the **Root Directory**.
3. Vercel will automatically detect Vite and set the build command to `npm run build`.

### Render (Backend)
Deploying the backend to Render as a Web Service:
1. Set the **Root Directory** to `backend`.
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. Add your `.env` variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`) in the Render dashboard.

## License
MIT License
