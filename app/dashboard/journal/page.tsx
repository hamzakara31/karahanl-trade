'use client'

import { useState, useEffect } from 'react'
import { journalService } from '@/services/journalService'
import { Journal } from '@/types'
import { Plus, Calendar, BookOpen, Trash2, Edit, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function JournalPage() {
  const router = useRouter()
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJournals()
  }, [])

  const loadJournals = async () => {
    setLoading(true)
    const data = await journalService.getJournals()
    setJournals(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu günlüğü silmek istediğinize emin misiniz?')) {
      const success = await journalService.deleteJournal(id)
      if (success) {
        loadJournals()
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="text-blue-600" size={36} />
              Trading Günlüğü
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Günlük trading notlarınız ve analizleriniz
            </p>
          </div>
          
          <Link href={`/dashboard/journal/edit?date=${getTodayDate()}`}>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              <Plus size={20} />
              Bugünün Günlüğü
            </button>
          </Link>
        </div>

        {/* Journal Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : journals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <div className="text-6xl mb-4">📓</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Henüz günlük kaydı yok
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Trading deneyimlerinizi kaydetmeye başlayın
            </p>
            <Link href={`/dashboard/journal/edit?date=${getTodayDate()}`}>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
                İlk Günlüğü Oluştur
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatDate(journal.date)}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(journal.created_at!).toLocaleTimeString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/journal/edit?date=${journal.date}`}>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit size={20} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(journal.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {journal.market_conditions && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        📊 Piyasa Durumu
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                        {journal.market_conditions}
                      </p>
                    </div>
                  )}

                  {journal.emotional_state && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        😊 Duygusal Durum
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                        {journal.emotional_state}
                      </p>
                    </div>
                  )}

                  {journal.wins && (
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">
                        ✅ Kazanımlar
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                        {journal.wins}
                      </p>
                    </div>
                  )}

                  {journal.losses && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">
                        ❌ Kayıplar
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                        {journal.losses}
                      </p>
                    </div>
                  )}

                  {journal.lessons_learned && (
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        💡 Öğrenilenler
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        {journal.lessons_learned}
                      </p>
                    </div>
                  )}
                </div>

                {/* Screenshots Preview */}
                {journal.screenshots && journal.screenshots.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="text-blue-600" size={20} />
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Fotoğraflar ({journal.screenshots.length})
                      </h4>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {journal.screenshots.slice(0, 4).map((url, idx) => (
                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <Image
                            src={url}
                            alt={`Screenshot ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {journal.screenshots.length > 4 && (
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 text-sm font-semibold">
                          +{journal.screenshots.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

