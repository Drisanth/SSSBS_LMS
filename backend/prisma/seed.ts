import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data (optional, but good for idempotent seeding)
  await prisma.reviewComment.deleteMany()
  await prisma.material.deleteMany()
  await prisma.teacherProfile.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin (Default system administrator)
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Principal Administrator',
      password: 'admin',
      role: 'ADMIN'
    }
  })
  console.log('Created Admin account. Please change the password upon first login.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
