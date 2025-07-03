import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { BucketORM, z, InferModel, createSchemaDefinition } from '../src/index';

// Test types
interface TestUser {
  id: string;
  name: string;
  email: string;
  age: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Test schema
const testUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
  active: z.boolean(),
});

type SchemaUser = InferModel<typeof testUserSchema>;

// Generate unique test IDs to avoid conflicts
const generateTestId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

describe('BucketORM', () => {
  let orm: BucketORM;
  let userModel: any;
  let schemaUserModel: any;
  let testIds: string[] = [];

  beforeAll(() => {
    // Initialize ORM with dedicated test bucket
    orm = new BucketORM({
      bucket: 'bucketorm-test', // Separate test bucket
      endpoint: 'http://localhost:9000',
      accessKeyId: 'minio',
      secretAccessKey: 'minio123',
      region: 'us-east-1',
      forcePathStyle: true,
    });

    userModel = orm.model<TestUser>('test_user');
    schemaUserModel = orm.schemaModel<SchemaUser>('test_schema_user', createSchemaDefinition(testUserSchema));
  });

  beforeEach(() => {
    // Reset test IDs for each test
    testIds = [];
  });

  afterEach(async () => {
    // Clean up test data after each test
    const cleanupPromises = testIds.map(async (id) => {
      try {
        await userModel.delete(id);
      } catch (error) {
        // Ignore cleanup errors - record might not exist
      }
      try {
        await schemaUserModel.delete(id);
      } catch (error) {
        // Ignore cleanup errors - record might not exist
      }
    });

    await Promise.all(cleanupPromises);
  });

  describe('Basic CRUD Operations', () => {
    it('should create a user record', async () => {
      const userId = generateTestId('test-user');
      testIds.push(userId);

      const userData = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        active: true,
      };

      const user = await userModel.create({ data: userData });

      expect(user.id).toBe(userData.id);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.age).toBe(userData.age);
      expect(user.active).toBe(userData.active);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should find a user by ID', async () => {
      const userId = generateTestId('test-user');
      testIds.push(userId);

      // Create a user first
      await userModel.create({
        data: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
          age: 25,
          active: true,
        }
      });

      const user = await userModel.findOne(userId);

      expect(user).toBeTruthy();
      expect(user.id).toBe(userId);
      expect(user.name).toBe('Test User');
    });

    it('should update a user record', async () => {
      const userId = generateTestId('test-user');
      testIds.push(userId);

      // Create a user first
      await userModel.create({
        data: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
          age: 25,
          active: true,
        }
      });

      const updatedUser = await userModel.update(userId, {
        data: { age: 26, name: 'Updated User' }
      });

      expect(updatedUser.age).toBe(26);
      expect(updatedUser.name).toBe('Updated User');
      expect(updatedUser.email).toBe('test@example.com'); // Should remain unchanged
      expect(updatedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should find all users', async () => {
      const userId1 = generateTestId('test-user');
      const userId2 = generateTestId('test-user');
      testIds.push(userId1, userId2);

      // Create first user
      await userModel.create({
        data: {
          id: userId1,
          name: 'Test User 1',
          email: 'test1@example.com',
          age: 25,
          active: true,
        }
      });

      // Create second user
      await userModel.create({
        data: {
          id: userId2,
          name: 'Test User 2',
          email: 'test2@example.com',
          age: 30,
          active: false,
        }
      });

      const users = await userModel.findMany();
      expect(users.length).toBeGreaterThanOrEqual(2);

      const userIds = users.map((u: any) => u.id);
      expect(userIds).toContain(userId1);
      expect(userIds).toContain(userId2);
    });

    it('should filter users with where clause', async () => {
      const userId1 = generateTestId('active-user');
      const userId2 = generateTestId('inactive-user');
      testIds.push(userId1, userId2);

      // Create active user
      await userModel.create({
        data: {
          id: userId1,
          name: 'Active User',
          email: 'active@example.com',
          age: 25,
          active: true,
        }
      });

      // Create inactive user
      await userModel.create({
        data: {
          id: userId2,
          name: 'Inactive User',
          email: 'inactive@example.com',
          age: 30,
          active: false,
        }
      });

      const activeUsers = await userModel.findMany({ where: { active: true } });
      const inactiveUsers = await userModel.findMany({ where: { active: false } });

      expect(activeUsers.every((u: any) => u.active === true)).toBe(true);
      expect(inactiveUsers.every((u: any) => u.active === false)).toBe(true);
    });

    it('should delete a user record', async () => {
      const userId = generateTestId('test-user');
      testIds.push(userId);

      // Create a user first
      await userModel.create({
        data: {
          id: userId,
          name: 'Test User',
          email: 'test@example.com',
          age: 25,
          active: true,
        }
      });

      await userModel.delete(userId);

      const deletedUser = await userModel.findOne(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Schema Validation', () => {
    it('should create a user with valid schema', async () => {
      const userId = generateTestId('schema-user');
      testIds.push(userId);

      const userData = {
        id: userId,
        name: 'Schema User',
        email: 'schema@example.com',
        age: 28,
        active: true,
      };

      const user = await schemaUserModel.createWithValidation({ data: userData });

      expect(user.id).toBe(userData.id);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });

    it('should reject invalid email format', async () => {
      const userId = generateTestId('invalid-user');
      testIds.push(userId);

      const userData = {
        id: userId,
        name: 'Invalid User',
        email: 'not-an-email',
        age: 25,
        active: true,
      };

      await expect(
        schemaUserModel.createWithValidation({ data: userData })
      ).rejects.toThrow('Schema validation failed');
    });

    it('should validate data without saving', () => {
      const validData = {
        id: generateTestId('valid-data'),
        name: 'Valid User',
        email: 'valid@example.com',
        age: 30,
        active: true,
      };

      const invalidData = {
        id: generateTestId('invalid-data'),
        name: 'Invalid User',
        email: 'not-an-email',
        age: 30,
        active: true,
      };

      expect(() => schemaUserModel.validateData(validData)).not.toThrow();
      expect(() => schemaUserModel.validateData(invalidData)).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for duplicate ID', async () => {
      const userId = generateTestId('duplicate-user');
      testIds.push(userId);

      const userData = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        active: true,
      };

      // Create the user first
      await userModel.create({ data: userData });

      // Try to create the same user again
      const duplicateUserData = {
        id: userId, // Same ID - should fail
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        age: 25,
        active: true,
      };

      await expect(
        userModel.create({ data: duplicateUserData })
      ).rejects.toThrow(`Record with ID '${userId}' already exists`);
    });

    it('should return null for non-existent user', async () => {
      const nonExistentId = generateTestId('non-existent');
      const user = await userModel.findOne(nonExistentId);
      expect(user).toBeNull();
    });

    it('should throw error when updating non-existent user', async () => {
      const nonExistentId = generateTestId('non-existent');
      await expect(
        userModel.update(nonExistentId, { data: { name: 'Updated' } })
      ).rejects.toThrow(`Record with ID '${nonExistentId}' not found`);
    });

    it('should throw error when deleting non-existent user', async () => {
      const nonExistentId = generateTestId('non-existent');
      await expect(
        userModel.delete(nonExistentId)
      ).rejects.toThrow(`Record with ID '${nonExistentId}' not found`);
    });
  });

  describe('TypeScript Types', () => {
    it('should export all necessary types', () => {
      expect(typeof BucketORM).toBe('function');
      expect(typeof createSchemaDefinition).toBe('function');
      expect(typeof z).toBe('object');
    });
  });
}); 