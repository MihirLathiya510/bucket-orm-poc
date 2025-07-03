<div align="center">
  <img src="https://i.imgur.com/4r5MN8t.png" alt="BucketORM Logo" width="200">
  <h1>BucketORM</h1>
  <p><strong>A TypeScript-first ORM for Amazon S3 and S3-compatible storage</strong></p>
  <p>💡 <em>Stop paying $50/month for databases to store simple JSON records.<br>Use S3 instead for ~$0.02/GB with zero compute costs.</em></p>
</div>

---

## 🚀 Why BucketORM?

**Perfect for applications that need:**
- Simple JSON document storage
- Cost-effective data persistence
- No complex relationships or joins
- Easy deployment without database setup
- TypeScript-first development experience

**Real-world use cases:**
- User profiles and preferences
- Application settings and configurations
- Event logs and analytics data
- Content management systems
- API caching and sessions

---

## ✨ Features

🎯 **TypeScript-First**: Full type safety with multiple ways to define models  
🔄 **Complete CRUD**: Create, Read, Update, Delete with familiar ORM syntax  
✅ **Schema Validation**: Built-in Zod integration for data validation  
🌐 **S3 Compatible**: Works with AWS S3, MinIO, Cloudflare R2, DigitalOcean Spaces  
⚡ **Zero Dependencies**: Lightweight with minimal external dependencies  
🏗️ **Developer Experience**: IDE autocompletion, error checking, and IntelliSense  
🔧 **Local Development**: Easy setup with MinIO for local testing  

---

## ⚡ Quick Start

### Installation

```bash
npm install bucketorm
```

### Basic Usage

```typescript
import { BucketORM, BucketRecord } from 'bucketorm';

// Define your data model
type User = BucketRecord<{
  name: string;
  email: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
  active: boolean;
}>;

// Initialize BucketORM
const orm = new BucketORM({
  bucket: 'my-app-data',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create a model
const userModel = orm.model<User>('user');

// Use it like any ORM
const user = await userModel.create({
  data: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    role: 'admin',
    active: true,
  }
});

// Query your data
const foundUser = await userModel.findOne('user-123');
const allUsers = await userModel.findMany();
const activeUsers = await userModel.findMany({ where: { active: true } });

// Update records
await userModel.update('user-123', { 
  data: { age: 31 } 
});

// Delete records
await userModel.delete('user-123');
```

---

## 🏃 Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd bucketorm
npm install
```

### 2. Start MinIO (Local S3)

```bash
# Copy environment configuration
cp .env.example .env

# Start MinIO with Docker
docker-compose up -d
```

**MinIO Console**: http://localhost:9090  
**Credentials**: `minio` / `minio123` (from .env file)

### 3. Run Examples

```bash
# Basic CRUD operations
npm run dev

# Schema validation with Zod
npm run dev:schema

# TypeScript patterns showcase
npm run dev:typescript
```

---

## 🎯 TypeScript Patterns

BucketORM offers **four ways** to define your models:

### 1. Manual Interface (Traditional)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

const userModel = orm.model<User>('user');
```

### 2. BucketRecord Utility (Simplified)

```typescript
type User = BucketRecord<{
  name: string;
  email: string;
  age: number;
}>;

const userModel = orm.model<User>('user');
```

### 3. Schema Inference (Recommended)

```typescript
import { z, InferModel, createSchemaDefinition } from 'bucketorm';

const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(13),
  role: z.enum(['admin', 'user', 'guest']),
});

type User = InferModel<typeof userSchema>;
const userModel = orm.schemaModel<User>('user', createSchemaDefinition(userSchema));

// Now with validation!
await userModel.createWithValidation({ data: { ... } });
```

### 4. Utility Types

```typescript
import { ModelData, CreateInput, UpdateInput } from 'bucketorm';

type UserData = ModelData<User>;         // For forms
type UserCreateInput = CreateInput<User>; // For creation
type UserUpdateInput = UpdateInput<User>; // For updates
```

📖 **[Complete TypeScript Guide](./TYPESCRIPT.md)** - Advanced patterns and best practices

---

## 🔧 Configuration

### Environment Variables

```bash
# AWS S3 (Production)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
BUCKET_NAME=your-bucket-name

# MinIO (Local Development)
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true

# Alternative S3-compatible services
# S3_ENDPOINT=https://your-r2-endpoint.com  # Cloudflare R2
# S3_ENDPOINT=https://your-space.region.digitaloceanspaces.com  # DigitalOcean
```

### Programmatic Configuration

```typescript
// AWS S3 (Production)
const orm = new BucketORM({
  bucket: 'production-bucket',
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// MinIO (Local Development)
const orm = new BucketORM({
  bucket: 'dev-bucket',
  endpoint: 'http://localhost:9000',
  accessKeyId: 'minio',
  secretAccessKey: 'minio123',
  region: 'us-east-1',
  forcePathStyle: true,
});

// Cloudflare R2
const orm = new BucketORM({
  bucket: 'my-r2-bucket',
  endpoint: 'https://your-account.r2.cloudflarestorage.com',
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
});
```

---

## 📊 Data Storage

### File Structure

```
s3://your-bucket/
├── user/
│   ├── user-123.json
│   ├── user-456.json
│   └── user-789.json
├── post/
│   ├── post-abc.json
│   └── post-def.json
└── profile/
    └── profile-xyz.json
```

### JSON Format

```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "role": "admin",
  "active": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 🛠️ Development

### Build and Test

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Testing

BucketORM uses a robust testing setup with proper isolation:

- **Test Isolation**: Each test uses unique IDs to avoid conflicts
- **Separate Test Bucket**: Tests use `bucketorm-test` bucket, isolated from development data
- **Automatic Cleanup**: `beforeEach`/`afterEach` hooks ensure clean state between tests
- **MinIO Integration**: Tests run against real MinIO instance for authentic testing

```bash
# Prerequisites: Start MinIO
docker-compose up -d

# Run all tests
npm test

# Tests include:
# ✓ CRUD operations (create, read, update, delete)
# ✓ Schema validation with Zod
# ✓ Error handling and edge cases
# ✓ TypeScript type safety
```

The test setup automatically creates both development (`bucketorm-dev`) and test (`bucketorm-test`) buckets in MinIO.

### Project Structure

```
bucketorm/
├── src/
│   ├── core/           # Core ORM classes
│   ├── adapters/       # Storage adapters
│   ├── types/          # TypeScript definitions
│   └── index.ts        # Main exports
├── examples/           # Usage examples
├── tests/              # Test files
└── docs/               # Documentation
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [Prisma](https://prisma.io) for the developer experience
- Built with [Zod](https://zod.dev) for schema validation
- Powered by [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) for S3 operations

---

<div align="center">
  <p>Made with ❤️ for developers who want simple, cost-effective data storage</p>
  <p>⭐ Star us on GitHub if BucketORM helps your project!</p>
</div>
