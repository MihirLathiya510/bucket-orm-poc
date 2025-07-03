import { BucketORM } from '../src/index';

// Define a User type
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function main() {
  console.log('🚀 BucketORM - Basic Example');
  console.log('===========================\n');

  // Create BucketORM instance
  const orm = new BucketORM({
    bucket: 'bucketorm-dev',
    endpoint: 'http://localhost:9000',
    accessKeyId: 'minio',
    secretAccessKey: 'minio123',
    region: 'us-east-1',
    forcePathStyle: true,
  });

  // Create a model
  const userModel = orm.model<User>('user');

  try {
    console.log('📝 Creating users...');

    // CREATE - Create multiple users
    const users = await Promise.all([
      userModel.create({
        data: {
          id: 'user1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          age: 28,
          role: 'admin',
          active: true,
        }
      }),
      userModel.create({
        data: {
          id: 'user2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          age: 32,
          role: 'user',
          active: true,
        }
      }),
      userModel.create({
        data: {
          id: 'user3',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          age: 25,
          role: 'guest',
          active: false,
        }
      })
    ]);

    console.log(`✅ Created ${users.length} users`);

    // READ - Find one user
    console.log('\n🔍 Finding user...');
    const foundUser = await userModel.findOne('user1');
    console.log(`✅ Found user: ${foundUser?.name} (${foundUser?.email})`);

    // READ - Find all users
    console.log('\n📋 Listing all users...');
    const allUsers = await userModel.findMany();
    console.log(`✅ Found ${allUsers.length} users:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.role}) - ${user.active ? 'Active' : 'Inactive'}`);
    });

    // UPDATE - Update a user
    console.log('\n✏️  Updating user...');
    const updatedUser = await userModel.update('user2', {
      data: {
        age: 33,
        role: 'admin',
      }
    });
    console.log(`✅ Updated ${updatedUser.name}: age ${updatedUser.age}, role ${updatedUser.role}`);

    // READ with filtering (basic)
    console.log('\n🔍 Finding active users...');
    const activeUsers = await userModel.findMany({
      where: { active: true }
    });
    console.log(`✅ Found ${activeUsers.length} active users`);

    // UPDATE - Deactivate a user
    console.log('\n🔄 Deactivating user...');
    await userModel.update('user3', {
      data: { active: true }
    });
    console.log('✅ User activated');

    // DELETE - Remove a user
    console.log('\n🗑️  Deleting user...');
    await userModel.delete('user3');
    console.log('✅ User deleted');

    // Verify deletion
    const finalUsers = await userModel.findMany();
    console.log(`✅ Final count: ${finalUsers.length} users remaining`);

    console.log('\n🎉 Basic CRUD operations completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ CREATE - Multiple users created');
    console.log('✅ READ - Find one and find many');
    console.log('✅ UPDATE - Partial updates with timestamps');
    console.log('✅ DELETE - Safe deletion with verification');
    console.log('✅ FILTER - Basic where clause filtering');

    console.log('\n🔍 Check MinIO console: http://localhost:9090');
    console.log('📁 Browse bucket: bucketorm-dev/user/');

  } catch (error) {
    console.error('❌ Error during basic operations:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n🔧 Make sure MinIO is running: docker-compose up -d');

    if (error instanceof Error) {
      console.error('\n📊 Error details:', error);
    }
  }
}

// Run the example
main().catch(console.error); 