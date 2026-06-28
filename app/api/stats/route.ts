import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  return password === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('type, topic, char_count')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const totalEntries = data.length
  const totalChars = data.reduce((sum, e) => sum + (e.char_count || 0), 0)
  const byType = data.reduce((acc: Record<string, number>, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {})
  const topics = [...new Set(data.map(e => e.topic))].sort()

  return NextResponse.json({ totalEntries, totalChars, byType, topics })
}
