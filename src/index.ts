// Main exports
export { BucketORM } from './core/bucketorm';
export { BucketModel } from './core/model';
export { BucketSchemaModel } from './core/schema-model';

// Type exports
export type {
  BucketORMConfig,
  StorageAdapter,
  CreateOptions,
  ModelRecord,
  Model,
  SchemaModel,
  BucketORMError,
  SchemaDefinition,
  FindManyOptions,
  UpdateOptions,
  DeleteOptions,
  FindOneOptions,
  // Utility types for better TypeScript DX
  BucketRecord,
  ModelData,
  CreateInput,
  UpdateInput,
  InferModel,
  SchemaInput,
} from './types';

// Helper functions
export { createSchemaDefinition } from './types';

// Exception export
export { BucketORMException } from './types';

// Adapter exports (for advanced usage)
export { S3StorageAdapter } from './adapters/s3';

// Zod re-export for convenience
export { z } from 'zod';

// Default export
export { BucketORM as default } from './core/bucketorm'; 