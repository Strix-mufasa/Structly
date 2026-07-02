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
// Seed components
  const components = [
    { code: '00', name: 'Composite', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '01', name: 'Disassembly', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '02', name: 'Clean-up and light demolition', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '03', name: 'Heavy demolition', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '04', name: 'Preparation', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '05', name: 'Hole making', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '06', name: 'Hole making', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '07', name: 'Work for installations', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '08', name: 'Other', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '09', name: 'Other', category: '0 CLEAN-UP AND DEMOLITION' },
    { code: '10', name: 'Composite', category: '1 MARK' },
    { code: '11', name: 'Capping, demolition, relocation', category: '1 MARK' },
    { code: '12', name: 'Dealers, filling', category: '1 MARK' },
    { code: '13', name: 'Ground reinforcement, drainage', category: '1 MARK' },
    { code: '14', name: 'Other', category: '1 MARK' },
    { code: '15', name: 'Other', category: '1 MARK' },
    { code: '16', name: 'Other', category: '1 MARK' },
    { code: '17', name: 'Other', category: '1 MARK' },
    { code: '18', name: 'Markup, retaining walls', category: '1 MARK' },
    { code: '19', name: 'Land Other', category: '1 MARK' },
    { code: '20', name: 'Composite', category: '2 HOUSE FOUNDATION' },
    { code: '21', name: 'Other', category: '2 HOUSE FOUNDATION' },
    { code: '22', name: 'Shafts, filling', category: '2 HOUSE FOUNDATION' },
    { code: '23', name: 'Ground reinforcement, drainage', category: '2 HOUSE FOUNDATION' },
    { code: '24', name: 'Basic Constructions', category: '2 HOUSE FOUNDATION' },
    { code: '25', name: 'Culverts, drainage', category: '2 HOUSE FOUNDATION' },
    { code: '26', name: 'Garage', category: '2 HOUSE FOUNDATION' },
    { code: '27', name: 'Slab on ground', category: '2 HOUSE FOUNDATION' },
    { code: '28', name: 'Housing Partnership', category: '2 HOUSE FOUNDATION' },
    { code: '29', name: 'Housing substructure', category: '2 HOUSE FOUNDATION' },
    { code: '30', name: 'Composite', category: '3 FRAME' },
    { code: '31', name: 'Frame walls', category: '3 FRAME' },
    { code: '32', name: 'Frame column', category: '3 FRAME' },
    { code: '33', name: 'Prefab', category: '3 FRAME' },
    { code: '34', name: 'Frame floors, beams', category: '3 FRAME' },
    { code: '35', name: 'Forging', category: '3 FRAME' },
    { code: '36', name: 'Frame, stairs, elevator shafts', category: '3 FRAME' },
    { code: '37', name: 'Combined roof frame', category: '3 FRAME' },
    { code: '38', name: 'Housing Partnership, Frame', category: '3 FRAME' },
    { code: '39', name: 'Other frame', category: '3 FRAME' },
    { code: '40', name: 'Composite', category: '4 ROOFS' },
    { code: '41', name: 'Roof frame', category: '4 ROOFS' },
    { code: '42', name: 'Roofing supplement', category: '4 ROOFS' },
    { code: '43', name: 'Roofing', category: '4 ROOFS' },
    { code: '44', name: 'Eaves and gables', category: '4 ROOFS' },
    { code: '45', name: 'Opening-additions to the roof', category: '4 ROOFS' },
    { code: '46', name: 'Sheet metal', category: '4 ROOFS' },
    { code: '47', name: 'Terrace roofs, balconies', category: '4 ROOFS' },
    { code: '48', name: 'Housing Partnership, Roof', category: '4 ROOFS' },
    { code: '49', name: 'Roof other', category: '4 ROOFS' },
    { code: '50', name: 'Composite', category: '5 FACADES' },
    { code: '51', name: 'Frame completion/folding', category: '5 FACADES' },
    { code: '52', name: 'Other', category: '5 FACADES' },
    { code: '53', name: 'Facade cladding', category: '5 FACADES' },
    { code: '54', name: 'Other', category: '5 FACADES' },
    { code: '55', name: 'Windows, doors, sections, glass', category: '5 FACADES' },
    { code: '56', name: 'Other', category: '5 FACADES' },
    { code: '57', name: 'Other', category: '5 FACADES' },
    { code: '58', name: 'Exterior walls', category: '5 FACADES' },
    { code: '59', name: 'Other', category: '5 FACADES' },
    { code: '60', name: 'Inside exterior wall', category: '6 STOMKOMP' },
    { code: '61', name: 'Other', category: '6 STOMKOMP' },
    { code: '62', name: 'Other', category: '6 STOMKOMP' },
    { code: '63', name: 'Subfloor', category: '6 STOMKOMP' },
    { code: '64', name: 'Ceiling', category: '6 STOMKOMP' },
    { code: '65', name: 'Interior doors, sections, glass', category: '6 STOMKOMP' },
    { code: '66', name: 'Internal stairs', category: '6 STOMKOMP' },
    { code: '67', name: 'Other', category: '6 STOMKOMP' },
    { code: '68', name: 'Housing Partnership, Spatial Formation', category: '6 STOMKOMP' },
    { code: '69', name: 'Other spatial formation', category: '6 STOMKOMP' },
    { code: '70', name: 'Composite', category: '7 INTERIOR SURFACES' },
    { code: '71', name: 'Other', category: '7 INTERIOR SURFACES' },
    { code: '72', name: 'Surface layers, floors, stairs', category: '7 INTERIOR SURFACES' },
    { code: '73', name: 'Surface wall', category: '7 INTERIOR SURFACES' },
    { code: '74', name: 'Surface layer roof, suspended ceiling', category: '7 INTERIOR SURFACES' },
    { code: '75', name: 'Painting', category: '7 INTERIOR SURFACES' },
    { code: '76', name: 'Appliances', category: '7 INTERIOR SURFACES' },
    { code: '77', name: 'Cabinet carpentry', category: '7 INTERIOR SURFACES' },
    { code: '78', name: 'Room comp.', category: '7 INTERIOR SURFACES' },
    { code: '79', name: 'Room comp. Other', category: '7 INTERIOR SURFACES' },
    { code: '80', name: 'Composite', category: '8 INSTALLATIONS' },
    { code: '81', name: 'Integrated solar cells', category: '8 INSTALLATIONS' },
    { code: '82', name: 'Process', category: '8 INSTALLATIONS' },
    { code: '83', name: 'Commercial kitchens', category: '8 INSTALLATIONS' },
    { code: '84', name: 'Sanitation, Heating', category: '8 INSTALLATIONS' },
    { code: '85', name: 'Other', category: '8 INSTALLATIONS' },
    { code: '86', name: 'Electricity', category: '8 INSTALLATIONS' },
    { code: '87', name: 'Transport', category: '8 INSTALLATIONS' },
    { code: '88', name: 'Governance and rules', category: '8 INSTALLATIONS' },
    { code: '89', name: 'Other installations', category: '8 INSTALLATIONS' },
    { code: '90', name: 'Save, Works composite', category: '9 JOINT WORKS' },
    { code: '91', name: 'Joint work', category: '9 JOINT WORKS' },
    { code: '92', name: 'Other', category: '9 JOINT WORKS' },
    { code: '93', name: 'Other', category: '9 JOINT WORKS' },
    { code: '94', name: 'Other', category: '9 JOINT WORKS' },
    { code: '95', name: 'Other', category: '9 JOINT WORKS' },
    { code: '96', name: 'Other', category: '9 JOINT WORKS' },
    { code: '97', name: 'Other', category: '9 JOINT WORKS' },
    { code: '98', name: 'Other', category: '9 JOINT WORKS' },
    { code: '99', name: 'Other', category: '9 JOINT WORKS' },
  ]

  for (const component of components) {
    await prisma.component.upsert({
      where: { code: component.code },
      update: {},
      create: component,
    })
  }
console.log('✅ Components seeded!')
  console.log('✅ Seed complete')
  console.log('Admin login: admin@structly.com / admin123')
  console.log('Employee login: anna@structly.com / employee123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
