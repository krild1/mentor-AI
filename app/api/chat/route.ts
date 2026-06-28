import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { question } = await req.json()

  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question manquante' }, { status: 400 })
  }

  const { data: entries } = await supabase
    .from('knowledge_entries')
    .select('type, topic, title, question, content')
    .order('created_at', { ascending: false })
    .limit(20)

  const context = entries?.map(e => {
    if (e.type === 'qa') return `Q: ${e.question}\nR: ${e.content}`
    const header = [e.title, e.topic ? `[${e.topic}]` : null].filter(Boolean).join(' ')
    return header ? `${header}\n${e.content}` : e.content
  }).join('\n\n---\n\n') || ''

  const mentorName = process.env.MENTOR_NAME || 'le mentor'

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `Tu es ${mentorName}. Voici tes connaissances, expériences et réponses que tu as partagées :

${context}

Réponds aux questions en te basant sur ces connaissances. Parle à la première personne, avec un style naturel et direct. Si la question n'est pas directement couverte par tes connaissances, utilise-les comme base pour répondre de façon cohérente avec ta façon de penser. Sois concis et utile.`,
    messages: [{ role: 'user', content: question }],
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
