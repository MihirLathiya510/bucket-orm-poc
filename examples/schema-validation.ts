import { BucketORM, z, InferModel, createSchemaDefinition } from '../src/index';

// Define Zod schema for validation
const userSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  email: z.string().email('Invalid email format'),
  age: z.number().int().min(13, 'Must be at least 13 years old').max(120, 'Invalid age'),
  role: z.enum(['admin', 'user', 'guest']),
  active: z.boolean(),
  metadata: z.object({
    lastLogin: z.date().optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']),
      notifications: z.boolean(),
    }),
  }).optional(),
});

// Infer the User type from the schema
type User = InferModel<typeof userSchema>;

async function main() {
  console.log('🚀 BucketORM - Schema Validation Example');
  console.log('=========================================\n');

  // Create BucketORM instance
  const orm = new BucketORM({
    bucket: 'bucketorm-dev',
    endpoint: 'http://localhost:9000',
    accessKeyId: 'minio',
    secretAccessKey: 'minio123',
    region: 'us-east-1',
    forcePathStyle: true,
  });

  // Create schema-aware model
  const userModel = orm.schemaModel<User>('user_validated', createSchemaDefinition(userSchema));

  try {
    console.log('✅ Testing VALID data creation...');

    // Create a user with valid data
    const validUser = await userModel.createWithValidation({
      data: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        role: 'admin',
        active: true,
        metadata: {
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
      }
    });
    console.log(`✅ Created valid user: ${validUser.name}`);

    console.log('\n✅ Testing VALID updates...');

    // Update with valid data
    const updatedUser = await userModel.updateWithValidation('user1', {
      data: {
        age: 31,
        metadata: {
          lastLogin: new Date(),
          preferences: {
            theme: 'light',
            notifications: false,
          },
        },
      }
    });
    console.log(`✅ Updated user: ${updatedUser.name}, age: ${updatedUser.age}`);

    console.log('\n❌ Testing INVALID data - Email validation...');

    // Try to create with invalid email
    try {
      await userModel.createWithValidation({
        data: {
          id: 'user2',
          name: 'Jane',
          email: 'invalid-email', // Invalid email format
          age: 25,
          role: 'user',
          active: true,
        }
      });
      console.log('❌ This should not succeed!');
    } catch (error) {
      console.log('✅ Correctly caught email validation error');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n❌ Testing INVALID data - Age validation...');

    // Try to create with invalid age
    try {
      await userModel.createWithValidation({
        data: {
          id: 'user3',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          age: 12, // Too young
          role: 'guest',
          active: false,
        }
      });
      console.log('❌ This should not succeed!');
    } catch (error) {
      console.log('✅ Correctly caught age validation error');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n❌ Testing INVALID data - Role validation...');

    // Try to create with invalid role
    try {
      await userModel.createWithValidation({
        data: {
          id: 'user4',
          name: 'Alice Smith',
          email: 'alice@example.com',
          age: 28,
          role: 'superadmin' as any, // Invalid role
          active: true,
        }
      });
      console.log('❌ This should not succeed!');
    } catch (error) {
      console.log('✅ Correctly caught role validation error');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n🔍 Testing standalone data validation...');

    // Test validateData method without saving
    try {
      const validatedData = userModel.validateData({
        id: 'test',
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        role: 'user',
        active: true,
      });
      console.log(`✅ Data validation passed: ${validatedData.name}`);
    } catch (error) {
      console.log(`❌ Data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n📋 Testing backward compatibility...');

    // Test that regular CRUD methods still work
    const regularUser = await userModel.create({
      data: {
        id: 'regular1',
        name: 'Regular User',
        email: 'regular@example.com',
        age: 35,
        role: 'user',
        active: true,
      }
    });
    console.log(`✅ Regular create still works: ${regularUser.name}`);

    await userModel.delete('regular1');
    console.log('✅ Regular delete still works');

    console.log('\n🎉 Schema validation testing completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Schema validation on create - prevents invalid data');
    console.log('✅ Schema validation on update - validates partial updates');
    console.log('✅ Proper error handling with detailed messages');
    console.log('✅ Standalone data validation without saving');
    console.log('✅ Backward compatibility with regular CRUD methods');
    console.log('✅ TypeScript type inference from Zod schemas');

    console.log('\n🔍 Check MinIO console: http://localhost:9090');
    console.log('📁 Browse bucket: bucketorm-dev/user_validated/');

  } catch (error) {
    console.error('❌ Error during schema validation testing:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\n🔧 Make sure MinIO is running: docker-compose up -d');

    if (error instanceof Error) {
      console.error('\n📊 Error details:', error);
    }
  }
}

// Run the example
main().catch(console.error); 