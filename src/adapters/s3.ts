import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { BucketORMConfig, StorageAdapter, BucketORMException } from '../types';

export class S3StorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(config: BucketORMConfig) {
    this.bucket = config.bucket;

    // Configure S3 client for both AWS S3 and MinIO
    this.client = new S3Client({
      region: config.region || 'us-east-1',
      credentials: config.accessKeyId && config.secretAccessKey ? {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      } : undefined,
      endpoint: config.endpoint, // For MinIO
      forcePathStyle: config.forcePathStyle || false, // Required for MinIO
    });
  }

  async upload(key: string, data: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: 'application/json',
      });

      await this.client.send(command);
    } catch (error) {
      throw new BucketORMException({
        code: 'STORAGE_ERROR',
        message: `Failed to upload object to S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }
  }

  async download(key: string): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        return null;
      }

      const body = await response.Body.transformToString();
      return body;
    } catch (error: any) {
      // Handle "NoSuchKey" error - return null for non-existent objects
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        return null;
      }

      throw new BucketORMException({
        code: 'STORAGE_ERROR',
        message: `Failed to download object from S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      throw new BucketORMException({
        code: 'STORAGE_ERROR',
        message: `Failed to delete object from S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }
  }

  async list(prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.client.send(command);

      return response.Contents?.map(obj => obj.Key || '') || [];
    } catch (error) {
      throw new BucketORMException({
        code: 'STORAGE_ERROR',
        message: `Failed to list objects from S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }
  }
} 