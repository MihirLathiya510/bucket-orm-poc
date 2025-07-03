import { z } from 'zod';
import { BucketModel } from './model';
import { StorageAdapter, ModelRecord, CreateOptions, UpdateOptions, BucketORMException, SchemaDefinition } from '../types';

export class BucketSchemaModel<T extends ModelRecord> extends BucketModel<T> {
  private schema: z.ZodTypeAny;

  constructor(modelName: string, storage: StorageAdapter, schemaDefinition: SchemaDefinition<T>) {
    super(modelName, storage);
    this.schema = schemaDefinition.schema;
  }

  /**
   * Create a record with schema validation
   */
  async createWithValidation(options: CreateOptions<Omit<T, 'createdAt' | 'updatedAt'>>): Promise<T> {
    const { data } = options;

    try {
      // Validate the data against the schema
      const validatedData = this.schema.parse(data);

      // Use the parent's create method with validated data
      return await this.create({ data: validatedData as any });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BucketORMException({
          code: 'INVALID_DATA',
          message: `Schema validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          details: error.errors,
        });
      }
      throw error;
    }
  }

  /**
 * Update a record with schema validation
 */
  async updateWithValidation(id: string, options: UpdateOptions<T>): Promise<T> {
    const { data } = options;

    try {
      // For updates, we create a partial schema if possible
      let validationSchema = this.schema;
      if ('partial' in this.schema && typeof this.schema.partial === 'function') {
        validationSchema = this.schema.partial();
      }

      // Validate the update data
      const validatedData = validationSchema.parse(data);

      // Use the parent's update method with validated data
      return await this.update(id, { data: validatedData as any });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BucketORMException({
          code: 'INVALID_DATA',
          message: `Schema validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          details: error.errors,
        });
      }
      throw error;
    }
  }

  /**
   * Get the Zod schema for this model
   */
  getSchema(): z.ZodTypeAny {
    return this.schema;
  }

  /**
   * Validate data without saving it
   */
  validateData(data: unknown): any {
    try {
      return this.schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BucketORMException({
          code: 'INVALID_DATA',
          message: `Schema validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          details: error.errors,
        });
      }
      throw error;
    }
  }
} 