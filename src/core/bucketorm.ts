import { BucketORMConfig, StorageAdapter, ModelRecord, SchemaDefinition } from '../types';
import { S3StorageAdapter } from '../adapters/s3';
import { BucketModel } from './model';
import { BucketSchemaModel } from './schema-model';

export class BucketORM {
  private storage: StorageAdapter;
  private models: Map<string, BucketModel<any>> = new Map();

  constructor(config: BucketORMConfig) {
    // Initialize storage adapter (currently only S3, but can be extended)
    this.storage = new S3StorageAdapter(config);
  }

  /**
 * Get or create a model for the given name
 * Usage: orm.model('user').create({ data: { ... } })
 */
  model<T extends ModelRecord>(modelName: string): BucketModel<T> {
    // Check if model already exists
    if (this.models.has(modelName)) {
      return this.models.get(modelName)!;
    }

    // Create new model instance
    const model = new BucketModel<T>(modelName, this.storage);
    this.models.set(modelName, model);

    return model;
  }

  /**
   * Get or create a schema-aware model for the given name
   * Usage: orm.schemaModel('user', { schema: userSchema }).createWithValidation({ data: { ... } })
   */
  schemaModel<T extends ModelRecord>(modelName: string, schemaDefinition: SchemaDefinition<T>): BucketSchemaModel<T> {
    const schemaKey = `${modelName}_schema`;

    // Check if schema model already exists
    if (this.models.has(schemaKey)) {
      return this.models.get(schemaKey)! as BucketSchemaModel<T>;
    }

    // Create new schema model instance
    const model = new BucketSchemaModel<T>(modelName, this.storage, schemaDefinition);
    this.models.set(schemaKey, model);

    return model;
  }

  /**
   * Static method to create a BucketORM instance with environment-based configuration
   */
  static fromEnv(): BucketORM {
    const config: BucketORMConfig = {
      bucket: process.env.BUCKET_NAME || 'bucketorm-dev',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT, // For MinIO
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    };

    return new BucketORM(config);
  }

  /**
   * Get the underlying storage adapter (useful for testing)
   */
  getStorage(): StorageAdapter {
    return this.storage;
  }
} 