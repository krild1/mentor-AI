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

  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')
  const type = searchParams.get('type')

  let query = supabase
    .from('knowledge_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (topic) query = query.eq('topic', topic)
  if (type) query = query.eq('type', type)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await req.json()
  const { type, topic, title, question, content, tags } = body

  if (!type || !topic || !content) {
    return NextResponse.json({ error: 'Champs manquants: type, topic, content' }, { status: 400 })
  }

  const fullText = question ? `${question}\n\n${content}` : content

  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert({
      type,
      topic: topic.toLowerCase().trim(),
      title: title?.trim() || null,
      question: question?.trim() || null,
      content: content.trim(),
      tags: tags || [],
      char_count: fullText.length,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
