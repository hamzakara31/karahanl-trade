'use client'

import { useState, useEffect, Suspense } from 'react'
import { journalService } from '@/services/journalService'
import { uploadService } from '@/services/uploadService'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Calendar, Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function JournalEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  
  const [loading, setLoading] = useState(false)
  const [loadingJournal, setLoadingJournal] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [journalId, setJournalId] = useState<string | null>(null)
  const [screenshots, setScreenshots] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    date: date,
    market_conditions: '',
    emotional_state: '',
    wins: '',
    losses: '',
    lessons_learned: '',
    improvement_areas: '',
    tomorrow_plan: ''
  })

  useEffect(() => {
    loadJournal()
  }, [date])

  const loadJournal = async () => {
    setLoadingJournal(true)
    const journal = await journalService.getJournalByDate(date)
    if (journal) {
      setJournalId(journal.id!)
      setFormData({
        date: journal.date,
        market_conditions: journal.market_conditions || '',
        emotional_state: journal.emotional_state || '',
        wins: journal.wins || '',
        losses: journal.losses || '',
        lessons_learned: journal.lessons_learned || '',
        improvement_areas: journal.improvement_areas || '',
        tomorrow_plan: journal.tomorrow_plan || ''
      })
      setScreenshots(journal.screenshots || [])
    }
    setLoadingJournal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      const dataWithScreenshots = {
        ...formData,
        screenshots: screenshots.length > 0 ? screenshots : undefined
      }
      
      if (journalId) {
        // Güncelle
        result = await journalService.updateJournal(journalId, dataWithScreenshots)
      } else {
        // Yeni oluştur
        result = await journalService.createJournal(dataWithScreenshots)
      }
      
      if (result) {
        router.push('/dashboard/journal')
      } else {
        setError('Günlük kaydedilirken hata oluştu')
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const fileArray = Array.from(files)
      const urls = await uploadService.uploadMultipleFiles(fileArray, 'journals')
      setScreenshots([...screenshots, ...urls])
    } catch (err) {
      setError('Fotoğraf yüklenirken hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveScreenshot = async (url: string) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      await uploadService.deleteFile(url)
      setScreenshots(screenshots.filter(s => s !== url))
    }
  }

  if (loadingJournal) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/journal" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-4">
            <ArrowLeft size={20} />
            Günlüklere Dön
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatDate(date)}
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {journalId ? 'Günlüğü düzenle' : 'Yeni günlük oluştur'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Piyasa Durumu */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              📊 Piyasa Durumu
            </h2>
            <textarea
              name="market_conditions"
              value={formData.market_conditions}
              onChange={handleChange}
              rows={4}
              placeholder="Bugün piyasa nasıldı? Trend neydi? Volatilite nasıldı?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Duygusal Durum */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              😊 Duygusal Durum
            </h2>
            <textarea
              name="emotional_state"
              value={formData.emotional_state}
              onChange={handleChange}
              rows={4}
              placeholder="Bugün kendinizi nasıl hissettiniz? Stres, güven, korku seviyeniz nasıldı?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Kazanımlar & Kayıplar */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-green-600 mb-4">
                ✅ Kazanımlar
              </h2>
              <textarea
                name="wins"
                value={formData.wins}
                onChange={handleChange}
                rows={6}
                placeholder="Bugün ne iyi gitti? Hangi kurallara uydunuz? Başarılı ne yaptınız?"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                ❌ Kayıplar & Hatalar
              </h2>
              <textarea
                name="losses"
                value={formData.losses}
                onChange={handleChange}
                rows={6}
                placeholder="Bugün ne yanlış gitti? Hangi hataları yaptınız? Kuralları nerede çiğnediniz?"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Öğrenilenler */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              💡 Öğrenilenler
            </h2>
            <textarea
              name="lessons_learned"
              value={formData.lessons_learned}
              onChange={handleChange}
              rows={4}
              placeholder="Bugünden ne öğrendiniz? Gelecekte neyi farklı yapacaksınız?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Gelişim Alanları */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              🎯 Gelişim Alanları
            </h2>
            <textarea
              name="improvement_areas"
              value={formData.improvement_areas}
              onChange={handleChange}
              rows={4}
              placeholder="Hangi alanlarda gelişmelisiniz? Hangi becerileri çalışmalısınız?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Yarının Planı */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              📅 Yarın İçin Plan
            </h2>
            <textarea
              name="tomorrow_plan"
              value={formData.tomorrow_plan}
              onChange={handleChange}
              rows={4}
              placeholder="Yarın ne yapmayı planlıyorsunuz? Hangi stratejileri uygulayacaksınız?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Screenshots/Fotoğraflar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="text-blue-600" size={24} />
              Fotoğraflar & Screenshots
            </h2>
            
            {/* Upload Button */}
            <div className="mb-6">
              <label className="cursor-pointer">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-slate-600 dark:text-slate-400">Yükleniyor...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="text-slate-400" size={40} />
                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold mb-1">
                          Fotoğraf Yükle
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          PNG, JPG, GIF (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Screenshots Grid */}
            {screenshots.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screenshots.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {screenshots.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Henüz fotoğraf eklenmedi
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Kaydediliyor...' : journalId ? 'Günlüğü Güncelle' : 'Günlüğü Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function JournalEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <JournalEditContent />
    </Suspense>
  )
}

