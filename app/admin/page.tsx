'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { KnowledgeEntry } from '@/lib/supabase'

const TYPE_LABELS: Record<string, string> = {
  qa: 'Q&A',
  article: 'Article',
  post: 'Post',
  text: 'Texte libre',
}

const TYPE_COLORS: Record<string, string> = {
  qa: 'bg-blue-100 text-blue-800',
  article: 'bg-green-100 text-green-800',
  post: 'bg-purple-100 text-purple-800',
  text: 'bg-gray-100 text-gray-800',
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [stats, setStats] = useState<{ totalEntries: number; totalChars: number; byType: Record<string, number>; topics: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [filterType, setFilterType] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchData = useCallback(async (pwd: string) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterTopic) params.set('topic', filterTopic)
      if (filterType) params.set('type', filterType)

      const [entriesRes, statsRes] = await Promise.all([
        fetch(`/api/content?${params}`, { headers: { 'x-admin-password': pwd } }),
        fetch('/api/stats', { headers: { 'x-admin-password': pwd } }),
      ])

      if (entriesRes.status === 401) {
        setAuthed(false)
        setError('Mot de passe incorrect')
        return
      }

      if (!entriesRes.ok || !statsRes.ok) {
        const failedRes = !entriesRes.ok ? entriesRes : statsRes
        const errBody = await failedRes.json().catch(() => ({}))
        setError(`Erreur serveur: ${errBody.error || 'inconnue'}`)
        return
      }

      const [entriesData, statsData] = await Promise.all([
        entriesRes.json(),
        statsRes.json(),
      ])

      setEntries(Array.isArray(entriesData) ? entriesData : [])
      setStats(statsData)
      setAuthed(true)
      sessionStorage.setItem('admin_pwd', pwd)
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [filterTopic, filterType])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pwd')
    if (saved) fetchData(saved)
  }, [fetchData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(password)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée ?')) return
    const pwd = sessionStorage.getItem('admin_pwd') || ''
    setDeleting(id)
    await fetch(`/api/content/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': pwd },
    })
    setEntries(prev => prev.filter(e => e.id !== id))
    setDeleting(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace mentor</h1>
          <p className="text-gray-500 text-sm mb-6">Accès réservé</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Connexion...' : 'Accéder'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Base de connaissance</h1>
            <p className="text-gray-500 mt-1">Gère ton contenu de mentor</p>
          </div>
          <Link
            href="/admin/add"
            className="bg-indigo-600 text-white rounded-xl px-5 py-2.5 font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Ajouter du contenu
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Entrées totales" value={stats.totalEntries} />
            <StatCard label="Mots de données" value={Math.round(stats.totalChars / 5)} />
            <StatCard label="Topics couverts" value={stats.topics.length} />
            <StatCard label="Q&As" value={stats.byType.qa || 0} />
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={filterTopic}
            onChange={e => { setFilterTopic(e.target.value); fetchData(sessionStorage.getItem('admin_pwd') || '') }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Tous les topics</option>
            {stats?.topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={e => { setFilterType(e.target.value); fetchData(sessionStorage.getItem('admin_pwd') || '') }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Tous les types</option>
            {['qa', 'article', 'post', 'text'].map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          {(filterTopic || filterType) && (
            <button
              onClick={() => { setFilterTopic(''); setFilterType(''); fetchData(sessionStorage.getItem('admin_pwd') || '') }}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Entries */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-400 text-lg mb-4">Aucun contenu encore</p>
            <Link href="/admin/add" className="text-indigo-600 font-medium hover:underline">
              Ajouter ta première entrée →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                deleting={deleting === entry.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function EntryCard({ entry, onDelete, deleting }: { entry: KnowledgeEntry; onDelete: (id: string) => void; deleting: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const preview = entry.question || entry.title || entry.content
  const displayText = expanded ? (entry.question ? `Q: ${entry.question}\n\nR: ${entry.content}` : entry.content) : preview.slice(0, 120) + (preview.length > 120 ? '…' : '')

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[entry.type]}`}>
              {TYPE_LABELS[entry.type]}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              #{entry.topic}
            </span>
            {entry.tags?.map(tag => (
              <span key={tag} className="text-xs text-gray-400 px-2 py-0.5 rounded-full border border-gray-200">
                {tag}
              </span>
            ))}
          </div>
          {entry.title && (
            <p className="font-semibold text-gray-900 mb-1">{entry.title}</p>
          )}
          <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{displayText}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-500 hover:text-indigo-700 mt-1"
          >
            {expanded ? 'Réduire' : 'Voir tout'}
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString('fr-FR')}</span>
          <button
            onClick={() => onDelete(entry.id)}
            disabled={deleting}
            className="text-gray-300 hover:text-red-500 transition text-lg disabled:opacity-30"
            title="Supprimer"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
