import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const S3_ENDPOINT = import.meta.env.VITE_SUPABASE_S3_ENDPOINT;
const S3_ACCESS_KEY = import.meta.env.VITE_SUPABASE_S3_ACCESS_KEY;
const S3_SECRET_KEY = import.meta.env.VITE_SUPABASE_S3_SECRET_KEY;
const S3_BUCKET = import.meta.env.VITE_SUPABASE_S3_BUCKET;
const S3_REGION = import.meta.env.VITE_SUPABASE_S3_REGION || 'us-east-1';

// Initialize S3 client
let s3Client: S3Client | null = null;

if (S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY) {
  s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true, // Required for Supabase S3
  });
  console.log('✅ Supabase S3 storage initialized');
} else {
  console.warn('❌ Supabase S3 credentials not configured');
}

export interface UploadResponse {
  path: string;
  publicUrl: string;
  error: Error | null;
}

// Upload JSON file to S3
export const uploadJSONFile = async (
  filename: string,
  data: any
): Promise<UploadResponse> => {
  if (!s3Client) {
    return {
      path: '',
      publicUrl: '',
      error: new Error('S3 client not initialized'),
    };
  }

  try {
    const jsonString = JSON.stringify(data, null, 2);
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: filename,
      Body: jsonString,
      ContentType: 'application/json',
      CacheControl: 'no-cache, no-store, must-revalidate', // Disable cache for real-time data
    });

    await s3Client.send(command);

    const publicUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${filename}`;

    return {
      path: filename,
      publicUrl,
      error: null,
    };
  } catch (err) {
    console.error('S3 upload error:', err);
    return {
      path: '',
      publicUrl: '',
      error: new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`),
    };
  }
};

// Download JSON file from S3 with cache busting
export const downloadJSONFile = async (filename: string): Promise<any | null> => {
  if (!s3Client) {
    console.error('S3 client not initialized');
    return null;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: filename,
      ResponseCacheControl: 'no-cache', // Request fresh data
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return null;
    }

    // Convert stream to string
    const bodyString = await response.Body.transformToString();
    const jsonObject = JSON.parse(bodyString);

    return jsonObject;
  } catch (err: any) {
    if (err.name === 'NoSuchKey') {
      console.log(`File ${filename} does not exist yet`);
      return null;
    }
    console.error('S3 download error:', err);
    return null;
  }
};

// Upload image file to S3
export const uploadImage = async (
  file: File,
  filename: string
): Promise<UploadResponse> => {
  if (!s3Client) {
    return {
      path: '',
      publicUrl: '',
      error: new Error('S3 client not initialized'),
    };
  }

  try {
    if (!file.type.startsWith('image/')) {
      return {
        path: '',
        publicUrl: '',
        error: new Error('File must be an image'),
      };
    }

    if (file.size > 50 * 1024 * 1024) {
      return {
        path: '',
        publicUrl: '',
        error: new Error('File must be smaller than 50MB'),
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: `images/${filename}`,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=86400',
    });

    await s3Client.send(command);

    const publicUrl = `${S3_ENDPOINT}/${S3_BUCKET}/images/${filename}`;

    return {
      path: `images/${filename}`,
      publicUrl,
      error: null,
    };
  } catch (err) {
    console.error('S3 image upload error:', err);
    return {
      path: '',
      publicUrl: '',
      error: new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`),
    };
  }
};

// List all files in S3 bucket
export const listFiles = async (prefix: string = ''): Promise<string[]> => {
  if (!s3Client) {
    console.error('S3 client not initialized');
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);

    return response.Contents?.map((item) => item.Key || '') || [];
  } catch (err) {
    console.error('S3 list error:', err);
    return [];
  }
};