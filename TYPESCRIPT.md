# 🎯 TypeScript Developer Experience Guide

This guide shows you how to get the most out of BucketORM's TypeScript support. We've designed the type system to be both powerful and ergonomic, giving you full type safety with minimal boilerplate.

## 🚀 Quick Start

```bash
npm install bucketorm
```

```typescript
import { BucketORM, z, BucketRecord, InferModel } from 'bucketorm';
```

## 🎨 Four Ways to Define Types

### 1. 📝 Manual Interface Definition (Traditional)

The traditional approach - define your interface explicitly:

```typescript
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

const userModel = orm.model<User>('user');
```

**Pros:** Full control, explicit types
**Cons:** More verbose, need to include BucketORM metadata

### 2. 🔧 BucketRecord Utility Type

Define just your data shape, we add the metadata:

```typescript
type Product = BucketRecord<{
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  tags?: string[];
}>;

const productModel = orm.model<Product>('product');
```

**Pros:** Less verbose, focuses on your data
**Cons:** Less explicit about BucketORM fields

### 3. 🎯 Schema Inference (Recommended)

Define a Zod schema and infer the type automatically:

```typescript
const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  published: z.boolean().default(false),
  authorId: z.string(),
  tags: z.array(z.string()).optional(),
});

// Type automatically inferred with BucketORM metadata
type Post = InferModel<typeof postSchema>;

const postModel = orm.schemaModel<Post>('post', createSchemaDefinition(postSchema));
```

**Pros:** Single source of truth, validation included, type-safe
**Cons:** Requires Zod knowledge

### 4. 🛠️ Utility Types for Common Patterns

Extract specific type shapes for different use cases:

```typescript
type Post = InferModel<typeof postSchema>;

// Extract just the data (no id, createdAt, updatedAt)
type PostData = ModelData<Post>;

// For create operations (includes id, no timestamps)
type PostCreateInput = CreateInput<Post>;

// For update operations (everything optional, no id/timestamps)
type PostUpdateInput = UpdateInput<Post>;
```

## 🔥 Advanced TypeScript Features

### Type-Safe Schema Definitions

```typescript
import { createSchemaDefinition } from 'bucketorm';

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(13).max(120),
  role: z.enum(['admin', 'user', 'guest']),
  active: z.boolean(),
});

// Helper creates properly typed schema definition
const userSchemaDef = createSchemaDefinition(userSchema);
type User = InferModel<typeof userSchema>;

const userModel = orm.schemaModel<User>('user', userSchemaDef);
```

### Nested Object Types

```typescript
const profileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  settings: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
  }),
  preferences: z.array(z.string()).optional(),
});

type Profile = InferModel<typeof profileSchema>;

// TypeScript knows the exact shape:
// profile.settings.theme // 'light' | 'dark'
// profile.settings.notifications.email // boolean
// profile.preferences // string[] | undefined
```

### Union Types and Discriminated Unions

```typescript
const eventSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('user_signup'),
    userId: z.string(),
    email: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('purchase'),
    userId: z.string(),
    productId: z.string(),
    amount: z.number(),
  }),
]);

type Event = InferModel<typeof eventSchema>;

// TypeScript provides intelligent autocomplete based on discriminator
if (event.type === 'user_signup') {
  console.log(event.email); // ✅ Available
  // console.log(event.amount); // ❌ Error: doesn't exist on this variant
}
```

## 🎯 Best Practices

### 1. Choose the Right Approach

- **Use Schema Inference** for new projects with validation needs
- **Use BucketRecord** for simple data structures
- **Use Manual Interfaces** when migrating existing code

### 2. Organize Your Types

```typescript
// types/models.ts
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
});

export type User = InferModel<typeof userSchema>;
export type Post = InferModel<typeof postSchema>;

// services/database.ts
import { userSchema, postSchema, User, Post } from './types/models';

export const userModel = orm.schemaModel<User>('user', createSchemaDefinition(userSchema));
export const postModel = orm.schemaModel<Post>('post', createSchemaDefinition(postSchema));
```

### 3. Use Utility Types for Forms

```typescript
// Perfect for React forms
type UserFormData = ModelData<User>; // No id, createdAt, updatedAt
type UserCreateData = CreateInput<User>; // Includes id
type UserUpdateData = UpdateInput<User>; // All optional

function UserForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
  });

  const handleSubmit = async () => {
    const createData: UserCreateData = {
      ...formData,
      id: generateId(),
    };
    
    await userModel.createWithValidation({ data: createData });
  };
}
```

### 4. Generic Helper Functions

```typescript
// Create reusable repository pattern
class Repository<T extends ModelRecord> {
  constructor(private model: BucketModel<T>) {}

  async findActive(): Promise<T[]> {
    return this.model.findMany({ 
      where: { active: true } 
    });
  }

  async createIfNotExists(data: CreateInput<T>): Promise<T> {
    const existing = await this.model.findOne(data.id);
    if (existing) return existing;
    
    return this.model.create({ data });
  }
}

const userRepo = new Repository(userModel);
const users = await userRepo.findActive(); // Fully typed!
```

## 🚨 Common TypeScript Errors and Solutions

### Error: "Property 'x' does not exist"

```typescript
// ❌ Wrong: Trying to access non-existent property
const user = await userModel.findOne('123');
console.log(user.invalidProperty); // Error!

// ✅ Correct: TypeScript knows the exact shape
console.log(user.name); // Works!
```

### Error: "Type 'string' is not assignable to type 'number'"

```typescript
// ❌ Wrong: Type mismatch
const user = await userModel.create({
  data: {
    id: 'user1',
    name: 'John',
    age: 'thirty', // Error: should be number
  }
});

// ✅ Correct: Proper types
const user = await userModel.create({
  data: {
    id: 'user1',
    name: 'John',
    age: 30, // Number
  }
});
```

### Error: "Cannot assign to 'createdAt' because it is read-only"

```typescript
// ❌ Wrong: Trying to modify read-only fields
await userModel.update('user1', {
  data: {
    name: 'John Updated',
    createdAt: new Date(), // Error: read-only
  }
});

// ✅ Correct: Only update mutable fields
await userModel.update('user1', {
  data: {
    name: 'John Updated',
  }
});
```

## 📦 Complete Example

```typescript
import { BucketORM, z, InferModel, createSchemaDefinition } from 'bucketorm';

// Define schema
const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(13),
  role: z.enum(['admin', 'user', 'guest']),
  active: z.boolean().default(true),
  metadata: z.object({
    lastLogin: z.date().optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']),
      notifications: z.boolean(),
    }),
  }).optional(),
});

// Infer type
type User = InferModel<typeof userSchema>;

// Setup
const orm = new BucketORM({ /* config */ });
const userModel = orm.schemaModel<User>('user', createSchemaDefinition(userSchema));

// Usage with full type safety
const user = await userModel.createWithValidation({
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

// TypeScript knows the exact shape
console.log(user.metadata?.preferences.theme); // 'dark'
console.log(user.createdAt); // Date
console.log(user.role); // 'admin'
```

## 🎓 Next Steps

1. **Try the examples**: Run `npm run dev:typescript` to see all patterns in action
2. **Check the source**: Look at `src/types/index.ts` for all available utility types
3. **Use with your framework**: The types work great with React, Vue, Angular, etc.
4. **Build your own utilities**: Extend the type system for your specific needs

## 🆘 Need Help?

- Check the main README for basic usage
- Look at the example files for working code
- The TypeScript compiler will guide you with helpful error messages
- All types are fully documented with JSDoc comments

Happy coding with type safety! 🚀 