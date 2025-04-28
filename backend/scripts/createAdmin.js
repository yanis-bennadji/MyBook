const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Admin user data
    const adminData = {
      username: 'Admin',
      email: 'admin@mybook.com',
      password: 'Admin@2024', // This will be hashed
      isAdmin: true,
      isVerified: true
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        username: adminData.username,
        email: adminData.email,
        password: hashedPassword,
        isAdmin: adminData.isAdmin,
        isVerified: adminData.isVerified
      }
    });

    console.log('Admin user created successfully:', {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      isAdmin: admin.isAdmin
    });
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 