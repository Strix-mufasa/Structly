import { PrismaClient, Role, UserStatus, TaskStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@structly.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@structly.com',
      passwordHash: adminHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  })

  // Create sample employee
  const empHash = await bcrypt.hash('employee123', 12)
  const employee = await prisma.user.upsert({
    where: { email: 'anna@structly.com' },
    update: {},
    create: {
      name: 'Anna Lindström',
      email: 'anna@structly.com',
      passwordHash: empHash,
      role: Role.EMPLOYEE,
      status: UserStatus.ACTIVE,
    },
  })

  // Create tasks
  const taskNames = [
    'Electrical Installation',
    'Plumbing Work',
    'Structural Work',
    'Painting & Finishing',
    'HVAC Installation',
    'Site Inspection',
    'Project Management',
    'Documentation',
  ]

  for (const name of taskNames) {
    await prisma.task.upsert({
      where: { name },
      update: {},
      create: { name, status: TaskStatus.ACTIVE },
    })
  }

  console.log('✅ Seed complete')
  console.log('Admin login: admin@structly.com / admin123')
  console.log('Employee login: anna@structly.com / employee123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
