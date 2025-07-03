import {
  BucketORM,
  z,
  BucketRecord,
  InferModel,
  createSchemaDefinition,
  ModelData,
  CreateInput,
  UpdateInput
} from '../src/index';

console.log('🚀 BucketORM - TypeScript Patterns Example');
console.log('==========================================\n');

// ===== METHOD 1: Manual Interface Definition =====
console.log('📝 Method 1: Manual Interface Definition');

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

// ===== METHOD 2: BucketRecord Utility Type =====
console.log('📝 Method 2: BucketRecord Utility Type');

type Product = BucketRecord<{
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  tags?: string[];
}>;

// ===== METHOD 3: Schema Inference =====
console.log('📝 Method 3: Schema Inference (Recommended)');

const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  published: z.boolean().default(false),
  authorId: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: z.object({
    views: z.number().default(0),
    likes: z.number().default(0),
  }).optional(),
});

type Post = InferModel<typeof postSchema>;

// ===== METHOD 4: Utility Types =====
console.log('📝 Method 4: Utility Types for Common Patterns');

type ProductData = ModelData<Product>;        // { name: string; price: number; ... }
type ProductCreateInput = CreateInput<Product>; // ProductData & { id: string }
type ProductUpdateInput = UpdateInput<Product>; // Partial<ProductData>

async function demonstrateTypePatterns() {
  console.log('\n🔧 Setting up BucketORM...');

  const orm = new BucketORM({
    bucket: 'bucketorm-dev',
    endpoint: 'http://localhost:9000',
    accessKeyId: 'minio',
    secretAccessKey: 'minio123',
    region: 'us-east-1',
    forcePathStyle: true,
  });

  console.log('\n✅ Method 1: Manual Interface');

  const userModel = orm.model<User>('user_manual');

  const user = await userModel.create({
    data: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      role: 'admin',
      active: true,
    }
  });

  console.log(`✅ Created user: ${user.name} (TypeScript knows age is ${typeof user.age})`);

  console.log('\n✅ Method 2: BucketRecord Utility');

  const productModel = orm.model<Product>('product_utility');

  const product = await productModel.create({
    data: {
      id: 'prod1',
      name: 'Laptop',
      price: 999.99,
      category: 'Electronics',
      inStock: true,
      tags: ['computers', 'tech'],
    }
  });

  console.log(`✅ Created product: ${product.name} (TypeScript knows price is ${typeof product.price})`);

  console.log('\n✅ Method 3: Schema Inference with Validation');

  const postModel = orm.schemaModel<Post>('post_schema', createSchemaDefinition(postSchema));

  const post = await postModel.createWithValidation({
    data: {
      id: 'post1',
      title: 'My First Post',
      content: 'This is the content of my first post',
      published: true,
      authorId: 'user1',
      tags: ['tech', 'programming'],
      metadata: {
        views: 0,
        likes: 0,
      },
    }
  });

  console.log(`✅ Created post: ${post.title} (TypeScript knows views is ${typeof post.metadata?.views})`);

  console.log('\n✅ Method 4: Utility Types in Action');

  // Extract just the data shape for forms
  const productForm: ProductData = {
    name: 'New Product',
    price: 199.99,
    category: 'Books',
    inStock: true,
    // No id, createdAt, updatedAt needed!
  };

  console.log(`📝 Product form data ready: ${productForm.name}`);

  // Create input with ID
  const createInput: ProductCreateInput = {
    ...productForm,
    id: 'prod2',
  };

  console.log(`➕ Create input ready: ${createInput.id}`);

  // Update input (everything optional)
  const updateInput: ProductUpdateInput = {
    price: 299.99, // Only update price
  };

  console.log(`✏️  Update input ready: ${updateInput.price}`);

  console.log('\n🎉 TypeScript patterns demonstration completed!');
  console.log('\n📊 Summary:');
  console.log('✅ Manual interfaces - Full control and explicit types');
  console.log('✅ BucketRecord utility - Less verbose, focuses on your data');
  console.log('✅ Schema inference - Single source of truth with validation');
  console.log('✅ Utility types - Extract shapes for forms and inputs');
  console.log('✅ Full type safety - IDE autocompletion and error checking');

  console.log('\n🔍 All methods provide:');
  console.log('• Complete TypeScript type safety');
  console.log('• IDE autocompletion and IntelliSense');
  console.log('• Compile-time error checking');
  console.log('• Runtime validation (with schemas)');
  console.log('• Consistent API across all approaches');
}

// Helper function to show type inference
function showTypeInference() {
  console.log('\n🔍 Type Inference Examples:');

  // Schema-first approach
  const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    priority: z.number().min(1).max(10),
  });

  // Type is automatically inferred!
  type Category = InferModel<typeof categorySchema>;

  console.log('✅ Category type inferred from schema');
  console.log('📋 Available fields: id, name, description, priority, createdAt, updatedAt');

  // TypeScript now knows Category has all these fields with correct types
  const exampleCategory: Category = {
    id: 'cat1',
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    priority: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log(`✅ Example category created: ${exampleCategory.name}`);
}

// Run the examples
demonstrateTypePatterns()
  .then(() => showTypeInference())
  .catch(console.error); 