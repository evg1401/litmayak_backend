import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';
import type { S3Opts } from 'configs/s3.config';
import {
  buildMediaHost,
  buildMediaKey,
  toMediaUrl,
  UploadCategory,
} from 'configs/media.config';
import { AppLogger } from '@/logger/logger.service';
import { getPersonalId } from '@/helpers';

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

const UPLOAD_URL_EXPIRES_SECONDS = 300;

@Injectable()
export class UploadsService {
  constructor(
    @Inject('S3_CONFIG') private readonly s3: S3Opts,
    private readonly logger: AppLogger,
  ) {}

  async createPresignedUpload(
    userId: number,
    category: UploadCategory,
    extension: string,
  ): Promise<PresignedUpload> {
    const personalId = await getPersonalId(userId);
    if (!personalId) {
      this.logger.warn(
        `presign: у пользователя id:${userId} не заполнен personalId`,
      );

      throw new NotFoundException({
        result: null,
        message: 'пользователь не найден',
      });
    }

    const objectKey = buildMediaKey(personalId, category, extension);
    const uploadUrl = this.createPresignedUploadUrl(objectKey);
    const publicUrl = toMediaUrl(objectKey);

    return { uploadUrl, publicUrl, key: objectKey };
  }

  // кодирование пути и подпись
  private canonicalUri(objectKey: string): string {
    const encoded = objectKey
      .replace(/^\/+/, '')
      .split('/')
      .map((part) => this.rawUrlEncode(part))
      .join('/');

    return `/${encoded}`;
  }

  private rawUrlEncode(value: string): string {
    return encodeURIComponent(value).replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  }

  private createPresignedUploadUrl(objectKey: string): string {
    const service = 's3';
    const host = buildMediaHost(this.s3);
    const timestamp = Math.floor(Date.now() / 1000);

    const amzDate = this.formatAmzDate(timestamp);
    const date = amzDate.slice(0, 8);

    const canonicalUri = this.canonicalUri(objectKey);

    const credential = `${this.s3.accessKey}/${date}/${this.s3.region}/${service}/aws4_request`;

    const queryParams: Record<string, string> = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': credential,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(UPLOAD_URL_EXPIRES_SECONDS),
      'X-Amz-SignedHeaders': 'host',
    };

    const canonicalQueryString = Object.entries(queryParams)
      .map(([key, value]) => [this.rawUrlEncode(key), this.rawUrlEncode(value)])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const credentialScope = `${date}/${this.s3.region}/${service}/aws4_request`;

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const kDate = createHmac('sha256', `AWS4${this.s3.secretKey}`)
      .update(date)
      .digest();
    const kRegion = createHmac('sha256', kDate).update(this.s3.region).digest();
    const kService = createHmac('sha256', kRegion).update(service).digest();
    const kSigning = createHmac('sha256', kService)
      .update('aws4_request')
      .digest();

    const signature = createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');

    const finalQuery = `${canonicalQueryString}&X-Amz-Signature=${signature}`;

    return `https://${host}${canonicalUri}?${finalQuery}`;
  }

  private formatAmzDate(timestampSeconds: number): string {
    return (
      new Date(timestampSeconds * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z'
    );
  }
}
