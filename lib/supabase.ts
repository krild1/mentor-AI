import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ContentType = 'qa' | 'article' | 'post' | 'text'

export interface KnowledgeEntry {
  id: string
  type: ContentType
  topic: string
  title: string | null
  question: string | null
  content: string
  tags: string[]
  char_count: number
  created_at: string
}
