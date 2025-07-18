import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Use placeholder values for development to prevent app crash
  console.warn('⚠️  Supabase environment variables not configured')
  console.warn('Please add your Supabase credentials to .env.local:')
  console.warn('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here')
}

// Create client with fallback values to prevent app crash
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Storage bucket helpers
export const uploadImage = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }
  return data
}

export const getImageUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

export const deleteImage = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    console.error('Supabase delete error:', error)
    throw new Error(`Delete failed: ${error.message}`)
  }
}
