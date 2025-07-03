import { StorageAdapter, ModelRecord, CreateOptions, UpdateOptions, FindManyOptions, BucketORMException } from '../types';

export class BucketModel<T extends ModelRecord> {
  private storage: StorageAdapter;
  private modelName: string;

  constructor(modelName: string, storage: StorageAdapter) {
    this.modelName = modelName;
    this.storage = storage;
  }

  /**
   * Create a new record in the bucket
   * File will be stored as: s3://bucket/modelName/id.json
   */
  async create(options: CreateOptions<Omit<T, 'createdAt' | 'updatedAt'>>): Promise<T> {
    const { data } = options;

    // Validate required fields
    if (!data.id || typeof data.id !== 'string') {
      throw new BucketORMException({
        code: 'INVALID_DATA',
        message: 'Record must have a valid string ID',
      });
    }

    // Check if record already exists
    const existingRecord = await this.getRecord(data.id);
    if (existingRecord) {
      throw new BucketORMException({
        code: 'RECORD_ALREADY_EXISTS',
        message: `Record with ID '${data.id}' already exists`,
      });
    }

    // Create the record with timestamps
    const now = new Date();
    const record: T = {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as T;

    // Generate the S3 key: modelName/id.json
    const key = this.generateKey(data.id);

    // Store the record as JSON
    const jsonData = JSON.stringify(record, null, 2);
    await this.storage.upload(key, jsonData);

    return record;
  }

  /**
   * Find a single record by ID
   */
  async findOne(id: string): Promise<T | null> {
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new BucketORMException({
        code: 'INVALID_DATA',
        message: 'ID must be a valid string',
      });
    }

    return await this.getRecord(id);
  }

  /**
 * Find all records for this model
 */
  async findMany(options?: FindManyOptions): Promise<T[]> {
    try {
      // List all objects with the model prefix
      const prefix = `${this.modelName}/`;
      const keys = await this.storage.list(prefix);

      // Filter to only .json files and extract IDs
      const jsonKeys = keys.filter(key => key.endsWith('.json'));

      // Load all records
      const records: T[] = [];
      for (const key of jsonKeys) {
        // Extract ID from key (remove prefix and .json extension)
        const id = key.replace(prefix, '').replace('.json', '');
        const record = await this.getRecord(id);
        if (record) {
          records.push(record);
        }
      }

      // Apply filtering if where clause is provided
      let filteredRecords = records;
      if (options?.where) {
        filteredRecords = records.filter(record => {
          return Object.entries(options.where!).every(([key, value]) => {
            return (record as any)[key] === value;
          });
        });
      }

      // Apply pagination
      let finalRecords = filteredRecords;
      if (options?.offset !== undefined) {
        finalRecords = finalRecords.slice(options.offset);
      }
      if (options?.limit !== undefined) {
        finalRecords = finalRecords.slice(0, options.limit);
      }

      return finalRecords;
    } catch (error) {
      if (error instanceof BucketORMException) {
        throw error;
      }

      throw new BucketORMException({
        code: 'STORAGE_ERROR',
        message: `Failed to retrieve records for model '${this.modelName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, options: UpdateOptions<T>): Promise<T> {
    const { data } = options;

    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new BucketORMException({
        code: 'INVALID_DATA',
        message: 'ID must be a valid string',
      });
    }

    // Check if record exists
    const existingRecord = await this.getRecord(id);
    if (!existingRecord) {
      throw new BucketORMException({
        code: 'RECORD_NOT_FOUND',
        message: `Record with ID '${id}' not found`,
      });
    }

    // Merge existing data with updates
    const updatedRecord: T = {
      ...existingRecord,
      ...data,
      id, // Ensure ID cannot be changed
      createdAt: existingRecord.createdAt, // Preserve creation date
      updatedAt: new Date(), // Update the timestamp
    } as T;

    // Save the updated record
    const key = this.generateKey(id);
    const jsonData = JSON.stringify(updatedRecord, null, 2);
    await this.storage.upload(key, jsonData);

    return updatedRecord;
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    // Validate ID
    if (!id || typeof id !== 'string') {
      throw new BucketORMException({
        code: 'INVALID_DATA',
        message: 'ID must be a valid string',
      });
    }

    // Check if record exists
    const existingRecord = await this.getRecord(id);
    if (!existingRecord) {
      throw new BucketORMException({
        code: 'RECORD_NOT_FOUND',
        message: `Record with ID '${id}' not found`,
      });
    }

    // Delete the record
    const key = this.generateKey(id);
    await this.storage.delete(key);
  }

  /**
   * Helper method to generate S3 key for a record
   */
  private generateKey(id: string): string {
    return `${this.modelName}/${id}.json`;
  }

  /**
   * Helper method to retrieve a record by ID (returns null if not found)
   */
  private async getRecord(id: string): Promise<T | null> {
    try {
      const key = this.generateKey(id);
      const jsonData = await this.storage.download(key);

      if (!jsonData) {
        return null;
      }

      const record = JSON.parse(jsonData) as T;

      // Convert date strings back to Date objects
      if (record.createdAt && typeof record.createdAt === 'string') {
        record.createdAt = new Date(record.createdAt);
      }
      if (record.updatedAt && typeof record.updatedAt === 'string') {
        record.updatedAt = new Date(record.updatedAt);
      }

      return record;
    } catch (error) {
      if (error instanceof BucketORMException) {
        throw error;
      }

      throw new BucketORMException({
        code: 'STORAGE_ERROR',
        message: `Failed to retrieve record with ID '${id}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }
  }
} 