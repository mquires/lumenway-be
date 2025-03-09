import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing file operations with S3-compatible storage
 */
@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  public constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      endpoint: this.configService.getOrThrow<string>('S3_ENDPOINT'),
      region: this.configService.getOrThrow<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'S3_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.bucket = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
  }

  /**
   * Uploads file to S3 bucket
   * @param buffer - File content buffer
   * @param key - File key/path in bucket
   * @param mimetype - File MIME type
   */
  public async upload(buffer: Buffer, key: string, mimetype: string) {
    const command: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: String(key),
      Body: buffer,
      ContentType: mimetype,
    };

    await this.client.send(new PutObjectCommand(command));
  }

  /**
   * Removes file from S3 bucket
   * @param key - File key/path in bucket
   */
  public async remove(key: string) {
    const command: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: String(key),
    };

    await this.client.send(new DeleteObjectCommand(command));
  }
}
