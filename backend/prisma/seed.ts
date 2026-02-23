import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@enterprise.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@enterprise.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        mobileNumber: '+1234567890'
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@enterprise.com');
    console.log('🔑 Password: password123');
    console.log('👤 Name: Admin User');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
