import { supabase } from './supabase'

export interface UploadResponse {
  path: string
  publicUrl: string
  error: Error | null
}

// LocalStorage fallback for when Supabase isn't configured
const STORAGE_KEY_PREFIX = 'probalyze_'

// Initialize storage buckets
export const initializeStorageBuckets = async () => {
  if (!supabase) {
    console.log('Using localStorage fallback (Supabase not configured)')
    return
  }

  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketNames = buckets?.map(b => b.name) || []

    // Create Probalyze bucket
    if (!bucketNames.includes('Probalyze')) {
      await supabase.storage.createBucket('Probalyze', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })
      console.log('Created Probalyze bucket')
    }
  } catch (err) {
    console.error('Bucket initialization error:', err)
  }
}

// Upload JSON file
export const uploadJSONFile = async (
  filename: string,
  data: any
): Promise<UploadResponse> => {
  // LocalStorage fallback
  if (!supabase) {
    try {
      const key = STORAGE_KEY_PREFIX + filename
      localStorage.setItem(key, JSON.stringify(data))
      return {
        path: filename,
        publicUrl: `localStorage://${key}`,
        error: null
      }
    } catch (err) {
      return {
        path: '',
        publicUrl: '',
        error: new Error(`LocalStorage failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  try {
    const jsonString = JSON.stringify(data, null, 2)
    const file = new Blob([jsonString], { type: 'application/json' })

    const { data: uploadData, error } = await supabase.storage
      .from('Probalyze')
      .upload(filename, file, {
        contentType: 'application/json',
        upsert: true,
        cacheControl: '3600',
      })

    if (error) {
      return { path: '', publicUrl: '', error }
    }

    const { data: urlData } = supabase.storage
      .from('Probalyze')
      .getPublicUrl(filename)

    return { 
      path: uploadData?.path || '', 
      publicUrl: urlData.publicUrl,
      error: null 
    }
  } catch (err) {
    return {
      path: '',
      publicUrl: '',
      error: new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
}

// Download JSON file
export const downloadJSONFile = async (filename: string): Promise<any | null> => {
  // LocalStorage fallback
  if (!supabase) {
    try {
      const key = STORAGE_KEY_PREFIX + filename
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.error('LocalStorage read error:', err)
      return null
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from('Probalyze')
      .download(filename)

    if (error) {
      console.error('Download error:', error)
      return null
    }

    if (!data) return null

    const arrayBuffer = await data.arrayBuffer()
    const jsonString = new TextDecoder('utf-8').decode(arrayBuffer)
    const jsonObject = JSON.parse(jsonString)

    return jsonObject
  } catch (err) {
    console.error('Parse error:', err)
    return null
  }
}

// Upload image file
export const uploadImage = async (
  file: File,
  filename: string
): Promise<UploadResponse> => {
  // LocalStorage fallback - convert to base64
  if (!supabase) {
    try {
      if (!file.type.startsWith('image/')) {
        return {
          path: '',
          publicUrl: '',
          error: new Error('File must be an image')
        }
      }

      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const base64 = await base64Promise
      const key = STORAGE_KEY_PREFIX + 'image_' + filename
      localStorage.setItem(key, base64)

      return {
        path: filename,
        publicUrl: base64,
        error: null
      }
    } catch (err) {
      return {
        path: '',
        publicUrl: '',
        error: new Error(`LocalStorage image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }

  try {
    if (!file.type.startsWith('image/')) {
      return {
        path: '',
        publicUrl: '',
        error: new Error('File must be an image')
      }
    }

    if (file.size > 50 * 1024 * 1024) {
      return {
        path: '',
        publicUrl: '',
        error: new Error('File must be smaller than 50MB')
      }
    }

    const { data, error } = await supabase.storage
      .from('Probalyze')
      .upload(filename, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: '86400',
      })

    if (error) {
      return { path: '', publicUrl: '', error }
    }

    const { data: urlData } = supabase.storage
      .from('Probalyze')
      .getPublicUrl(filename)

    return { 
      path: data?.path || '', 
      publicUrl: urlData.publicUrl,
      error: null 
    }
  } catch (err) {
    return {
      path: '',
      publicUrl: '',
      error: new Error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
}

// List all market files
export const listMarketFiles = async (): Promise<string[]> => {
  // LocalStorage fallback
  if (!supabase) {
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEY_PREFIX) && key.endsWith('.json')) {
          keys.push(key.replace(STORAGE_KEY_PREFIX, ''))
        }
      }
      return keys
    } catch (err) {
      console.error('LocalStorage list error:', err)
      return []
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from('Probalyze')
      .list('', { limit: 100 })

    if (error) {
      console.error('List error:', error)
      return []
    }

    return data?.map(file => file.name).filter(name => name.endsWith('.json')) || []
  } catch (err) {
    console.error('Error:', err)
    return []
  }
}