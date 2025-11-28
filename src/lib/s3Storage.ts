import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const S3_ENDPOINT = import.meta.env.VITE_SUPABASE_S3_ENDPOINT;
const S3_ACCESS_KEY = import.meta.env.VITE_SUPABASE_S3_ACCESS_KEY;
const S3_SECRET_KEY = import.meta.env.VITE_SUPABASE_S3_SECRET_KEY;
const S3_BUCKET = import.meta.env.VITE_SUPABASE_S3_BUCKET;
const S3_REGION = import.meta.env.VITE_SUPABASE_S3_REGION || 'us-east-1';

// LocalStorage fallback prefix
const STORAGE_KEY_PREFIX = 'probalyze_s3_fallback_';

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
  console.warn('⚠️ Supabase S3 credentials not configured - using localStorage fallback');
}

// Helper: Save to localStorage fallback
const saveToFallback = (filename: string, data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + filename, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${filename} to localStorage:`, e);
  }
};

// Helper: Load from localStorage fallback
const loadFromFallback = (filename: string): any | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + filename);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Failed to load ${filename} from localStorage:`, e);
    return null;
  }
};

// Retry logic with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class StorageError extends Error {
  constructor(message: string, public readonly isNetworkError: boolean = false) {
    super(message);
    this.name = 'StorageError';
  }
}

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 6,
  initialDelayMs: number = 200
): Promise<{ data: T | null; error: Error | null }> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await fn();
      return { data, error: null };
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(`⏱️ Retry attempt ${attempt + 1}/${maxRetries} in ${delayMs}ms... Error: ${lastError.message}`);
        await sleep(delayMs);
      } else {
        console.error(`❌ Final retry failed after ${maxRetries} attempts:`, error);
      }
    }
  }
  
  return { 
    data: null, 
    error: new StorageError(`Failed after ${maxRetries} retries`, true) 
  };
};

export interface UploadResponse {
  path: string;
  publicUrl: string;
  error: Error | null;
}

// Upload JSON file to S3 with retry logic and localStorage fallback
export const uploadJSONFile = async (
  filename: string,
  data: any
): Promise<UploadResponse> => {
  const jsonString = JSON.stringify(data, null, 2);

  // Try S3 upload first if client is available
  if (s3Client) {
    const { data: uploadSuccess, error } = await retryWithBackoff(async () => {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: filename,
        Body: jsonString,
        ContentType: 'application/json',
        CacheControl: 'no-cache, no-store, must-revalidate', // Disable cache for real-time data
      });

      await s3Client!.send(command);
      return true;
    }, 6, 200);

    if (uploadSuccess) {
      const publicUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${filename}`;
      return {
        path: filename,
        publicUrl,
        error: null,
      };
    }

    console.warn(`⚠️ S3 upload failed for ${filename}, saving to localStorage fallback... (${error?.message})`);
  }

  // Fallback to localStorage
  try {
    saveToFallback(filename, data);
    return {
      path: filename,
      publicUrl: `localStorage://${STORAGE_KEY_PREFIX}${filename}`,
      error: null,
    };
  } catch (err) {
    return {
      path: '',
      publicUrl: '',
      error: new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`),
    };
  }
};

export interface DownloadResult {
  data: any | null;
  error: Error | null;
  usedFallback: boolean;
}

// Download JSON file from S3 with retry logic and localStorage fallback
export const downloadJSONFile = async (filename: string): Promise<DownloadResult> => {
  // Try S3 first if client is available
  if (s3Client) {
    const { data: result, error } = await retryWithBackoff(async () => {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: filename,
        ResponseCacheControl: 'no-cache', // Request fresh data
      });

      const response = await s3Client!.send(command);

      if (!response.Body) {
        return null;
      }

      // Convert stream to string
      const bodyString = await response.Body.transformToString();
      const jsonObject = JSON.parse(bodyString);
      
      // Successful S3 load - also cache to localStorage as backup
      saveToFallback(filename, jsonObject);
      
      return jsonObject;
    }, 6, 200);

    if (result !== null) {
      return { data: result, error: null, usedFallback: false };
    }

    console.warn(`⚠️ S3 download failed for ${filename}, falling back to localStorage cache... (${error?.message})`);
  }

  // Fallback to localStorage if S3 failed or not available
  const fallbackData = loadFromFallback(filename);
  if (fallbackData !== null) {
    console.log(`✅ Loaded ${filename} from localStorage fallback (cached data)`);
    return { data: fallbackData, error: null, usedFallback: true };
  }

  // Final fallback: return error
  const error = new StorageError(`Could not load ${filename} from S3 or localStorage`, true);
  console.warn(`❌ ${error.message}`);
  return { data: null, error, usedFallback: false };
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

// List all files in S3 bucket with retry logic
export const listFiles = async (prefix: string = ''): Promise<string[]> => {
  if (!s3Client) {
    console.warn('S3 client not initialized for listFiles');
    return [];
  }

  const { data: result, error } = await retryWithBackoff(async () => {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client!.send(command);
    return response.Contents?.map((item) => item.Key || '') || [];
  }, 6, 200);

  if (error) {
    console.warn(`⚠️ Failed to list files: ${error.message}`);
  }

  return result || [];
};