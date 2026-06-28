'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ContentType } from '@/lib/supabase'

const TYPES: { value: ContentType; label: string; description: string }[] = [
  { value: 'qa', label: 'Q&A', description: 'Une question + ta réponse' },
  { value: 'article', label: 'Article', description: 'Un texte long structuré' },
  { value: 'post', label: 'Post', description: 'Un post court (LinkedIn, Twitter...)' },
  { value: 'text', label: 'Texte libre', description: 'N\'importe quel contenu' },
]

export default function AddContent() {
  const router = useRouter()
  const [type, setType] = useState<ContentType>('qa')
  const [topic, setTopic] = useState('')
  const [title, setTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const charCount = (question + content).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) { setError('Le topic est obligatoire'); return }
    if (!content.trim()) { setError('Le contenu est obligatoire'); return }
    if (type === 'qa' && !question.trim()) { setError('La question est obligatoire pour un Q&A'); return }

    const pwd = sessionStorage.getItem('admin_pwd')
    if (!pwd) { router.push('/admin'); return }

    setSaving(true)
    setError('')

    const res = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': pwd,
      },
      body: JSON.stringify({
        type,
        topic: topic.trim(),
        title: title.trim() || null,
        question: type === 'qa' ? question.trim() : null,
        content: content.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Erreur lors de la sauvegarde')
      setSaving(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setQuestion('')
      setContent('')
      setTitle('')
      setTags('')
    }, 1500)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">
            ← Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ajouter du contenu</h1>
            <p className="text-gray-500 text-sm mt-0.5">Enrichis ta base de connaissance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type de contenu
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    type === t.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className={`font-semibold text-sm ${type === t.value ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Topic <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="ex: comment-apprendre, mindset, productivité..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Un seul mot-clé, sans espace (utilise des tirets)</p>
          </div>

          {/* Title (optional, not for QA) */}
          {type !== 'qa' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Titre <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titre de l'article ou du post..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}

          {/* Question (QA only) */}
          {type === 'qa' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Question <span className="text-red-400">*</span>
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Quelle est la meilleure façon d'apprendre une nouvelle compétence ?"
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {type === 'qa' ? 'Réponse' : 'Contenu'} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                type === 'qa'
                  ? 'Ta réponse détaillée, avec tes exemples, ton vécu, tes conseils...'
                  : 'Colle ici ton article, post, ou texte...'
              }
              rows={10}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">
              {charCount.toLocaleString()} caractères
              {charCount > 500 && ' · '}
              {charCount > 500 && <span className="text-green-600">Excellent pour l&apos;IA</span>}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tags <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="mémorisation, répétition espacée, neuroscience"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Séparés par des virgules</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
              ✓ Contenu sauvegardé ! Tu peux en ajouter un autre.
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white rounded-xl px-5 py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <Link
              href="/admin"
              className="px-5 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-medium"
            >
              Voir tout
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
