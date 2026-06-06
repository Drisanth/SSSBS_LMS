# SSSBS LMS

A modern, highly responsive Study Material Repository Platform and Learning Management System designed for schools to manage resources, teachers, and future student integrations seamlessly.

## ✨ Key Features

- **Teacher Connect Module**: A magical, QR-code powered system allowing teachers to quickly beam educational YouTube links, websites, and resources directly from their mobile phones to their secure desktop inbox—completely bypassing the need for WhatsApp, shared browser logins, or external apps on public computers.
- **Public Dashboard**: A lightning-fast, beautifully designed portal for browsing and filtering study materials by Grade, Subject, and Chapter.
- **Teacher Portal**: Secure dashboard for teachers to upload, edit, manage, and version study links and repository resources.
- **Admin Panel**: Comprehensive management suite to oversee teacher accounts, review platform materials, and maintain the repository.
- **Modern UI/UX**: Notion/Linear-inspired aesthetic featuring a custom, lightweight CSS design system, responsive fluid grid layouts, and smooth micro-animations.
- **Future-Ready DB Schema**: Pre-architected with PostgreSQL for scaling into full student enrollment, assignments, and attendance tracking.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TypeScript, React Router, Lucide React Icons
- **Styling**: Custom zero-dependency CSS Design System (Tailwind-inspired utilities with dynamic fluid grids)
- **Backend**: Node.js, Express, TypeScript, JWT Authentication
- **Database / ORM**: PostgreSQL database managed via Prisma ORM

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (e.g., Supabase, Neon, or local instance)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your database connection strings and `JWT_SECRET`.
4. Initialize the database and seed the default Admin user:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
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
After running the seed script, log in to the admin panel with:
- **Username**: `admin`
- **Password**: `admin123`
*(Make sure to change this upon first login!)*

## ☁️ Deployment Guide

### Vercel (Frontend)
The frontend is pre-configured with a `vercel.json` file for zero-config SPA routing.
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` folder as the **Root Directory**.
3. Vercel will automatically detect Vite and set the build command to `npm run build`.

### Render (Backend)
Deploying the backend to Render as a Node Web Service:
1. Connect your repository to Render.
2. Set the **Root Directory** to `backend`.
3. **Build Command**: `npm install && npx prisma generate && npm run build`
4. **Start Command**: `npm run start`
5. Add your `.env` variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CORS_ORIGIN`) in the Render dashboard.

## 📄 License
MIT License
