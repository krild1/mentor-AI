import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          MentorAI
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          Apprends auprès des meilleurs mentors, comme si tu leur parlais en personne.
        </p>
        <Link
          href="/admin"
          className="inline-block bg-indigo-600 text-white rounded-xl px-8 py-3.5 font-semibold text-lg hover:bg-indigo-700 transition"
        >
          Espace mentor →
        </Link>
      </div>
    </div>
  )
}
