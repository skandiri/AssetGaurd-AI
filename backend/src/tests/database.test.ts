// Database Test Script - Verify Prisma operations with User model
import prisma from '../config/database.js';

// ==============================
// Test Functions
// ==============================

async function runTests() {
  console.log('\n🧪 Starting Database Tests...\n');

  try {
    // Test 1: Create a user
    console.log('📝 Test 1: Creating a user...');
    const newUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User'
      }
    });
    console.log('✅ User created:', newUser);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.name}\n`);

    // Test 2: Fetch all users
    console.log('📋 Test 2: Fetching all users...');
    const allUsers = await prisma.user.findMany();
    console.log(`✅ Found ${allUsers.length} user(s):`);
    allUsers.forEach((user) => {
      console.log(`   - ${user.email} (${user.name})`);
    });
    console.log();

    // Test 3: Get user by ID
    console.log(`🔍 Test 3: Fetching user by ID (${newUser.id})...`);
    const userById = await prisma.user.findUnique({
      where: { id: newUser.id }
    });
    console.log('✅ User found:');
    console.log(`   Email: ${userById?.email}`);
    console.log(`   Name: ${userById?.name}\n`);

    // Test 4: Update user
    console.log(`✏️  Test 4: Updating user...`);
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: {
        name: 'Updated Test User'
      }
    });
    console.log('✅ User updated:');
    console.log(`   Name changed to: ${updatedUser.name}\n`);

    // Test 5: Delete user
    console.log(`🗑️  Test 5: Deleting user...`);
    await prisma.user.delete({
      where: { id: newUser.id }
    });
    console.log('✅ User deleted successfully\n');

    // Test 6: Verify deletion
    console.log(`🔍 Test 6: Verifying deletion...`);
    const deletedUser = await prisma.user.findUnique({
      where: { id: newUser.id }
    });
    if (!deletedUser) {
      console.log('✅ Confirmed: User no longer exists\n');
    }

    console.log('═══════════════════════════════════════════');
    console.log('🎉 All Database Tests Passed Successfully!');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
