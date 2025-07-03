import { z } from 'zod';

export interface BucketORMConfig {
  bucket: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string; // For MinIO or other S3-compatible services
  forcePathStyle?: boolean; // Required for MinIO
}

export interface SchemaDefinition<T extends ModelRecord> {
  schema: z.ZodTypeAny;
}

export interface StorageAdapter {
  upload(key: string, data: string): Promise<void>;
  download(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export interface CreateOptions<T> {
  data: T & { id: string };
}

export interface ModelRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

// === UTILITY TYPES FOR BETTER DX ===

/**
 * Helper type to create a model type from your data shape
 * Usage: type User = BucketRecord<{ name: string; email: string; age: number }>
 */
export type BucketRecord<T extends Record<string, any>> = T & ModelRecord;

/**
 * Extract the data shape from a model type (removes BucketORM metadata)
 * Usage: type UserData = ModelData<User>
 */
export type ModelData<T extends ModelRecord> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Create input type for creating records (includes id, excludes timestamps)
 * Usage: type CreateUserInput = CreateInput<User>
 */
export type CreateInput<T extends ModelRecord> = ModelData<T> & { id: string };

/**
 * Create input type for updating records (partial, excludes id and timestamps)
 * Usage: type UpdateUserInput = UpdateInput<User>
 */
export type UpdateInput<T extends ModelRecord> = Partial<ModelData<T>>;

/**
 * Infer TypeScript type from Zod schema and add BucketORM metadata
 * Usage: type User = InferModel<typeof userSchema>
 */
export type InferModel<T extends z.ZodTypeAny> = z.infer<T> & ModelRecord;

/**
 * Type for the data that goes into schema validation (no timestamps)
 * Usage: type UserSchemaInput = SchemaInput<User>
 */
export type SchemaInput<T extends ModelRecord> = Omit<T, 'createdAt' | 'updatedAt'>;

/**
 * Helper to create a properly typed schema definition from a Zod schema
 * Usage: const userDef = createSchemaDefinition(userSchema)
 */
export const createSchemaDefinition = <T extends z.ZodTypeAny>(
  schema: T
): SchemaDefinition<InferModel<T>> => ({ schema });

// === END UTILITY TYPES ===

export interface FindOneOptions {
  id: string;
}

export interface UpdateOptions<T> {
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
}

export interface DeleteOptions {
  id: string;
}

export interface FindManyOptions {
  where?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface Model<T extends ModelRecord> {
  create(options: CreateOptions<Omit<T, 'createdAt' | 'updatedAt'>>): Promise<T>;
  findOne(id: string): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  update(id: string, options: UpdateOptions<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface SchemaModel<T extends ModelRecord> extends Model<T> {
  // Schema-aware methods with validation
  createWithValidation(options: CreateOptions<Omit<T, 'createdAt' | 'updatedAt'>>): Promise<T>;
  updateWithValidation(id: string, options: UpdateOptions<T>): Promise<T>;
  validateData(data: unknown): ModelData<T>;
  getSchema(): z.ZodTypeAny;
}

export type BucketORMError = {
  code: 'RECORD_NOT_FOUND' | 'RECORD_ALREADY_EXISTS' | 'STORAGE_ERROR' | 'INVALID_DATA';
  message: string;
  details?: any;
};

export class BucketORMException extends Error {
  constructor(
    public readonly error: BucketORMError
  ) {
    super(error.message);
    this.name = 'BucketORMException';
  }
} 