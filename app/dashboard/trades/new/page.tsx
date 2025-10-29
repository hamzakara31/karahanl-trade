'use client'

import { useState, useEffect } from 'react'
import { tradeService } from '@/services/tradeService'
import { tagService } from '@/services/tagService'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, TrendingUp, TrendingDown, Target, AlertTriangle, Tag as TagIcon } from 'lucide-react'
import Link from 'next/link'
import { Tag } from '@/types'

export default function NewTradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'LONG' as 'LONG' | 'SHORT',
    entry_price: '',
    exit_price: '',
    quantity: '',
    entry_date: '',
    exit_date: '',
    commission: '',
    strategy: '',
    notes: '',
    // Yeni alanlar
    rating: 3,
    profit_target: '',
    stop_loss: '',
    initial_target: '',
    execution_quality: 'good',
    emotions: [] as string[]
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    const tags = await tagService.getTags()
    setAvailableTags(tags)
  }

  const emotionOptions = [
    { value: 'confident', label: '😊 Kendinden Emin', color: 'bg-green-100 text-green-800' },
    { value: 'nervous', label: '😰 Gergin', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'fomo', label: '😱 FOMO', color: 'bg-red-100 text-red-800' },
    { value: 'patient', label: '🧘 Sabırlı', color: 'bg-blue-100 text-blue-800' },
    { value: 'greedy', label: '🤑 Açgözlü', color: 'bg-orange-100 text-orange-800' },
    { value: 'fearful', label: '😨 Korkulu', color: 'bg-purple-100 text-purple-800' },
  ]

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Risk hesaplama
  const calculateRisk = () => {
    const entry = parseFloat(formData.entry_price)
    const stopLoss = parseFloat(formData.stop_loss)
    const quantity = parseInt(formData.quantity)
    
    if (entry && stopLoss && quantity) {
      const risk = Math.abs((entry - stopLoss) * quantity)
      return risk.toFixed(2)
    }
    return '0.00'
  }

  // Risk/Reward ratio
  const calculateRRRatio = () => {
    const entry = parseFloat(formData.entry_price)
    const target = parseFloat(formData.profit_target)
    const stopLoss = parseFloat(formData.stop_loss)
    
    if (entry && target && stopLoss) {
      const reward = Math.abs(target - entry)
      const risk = Math.abs(entry - stopLoss)
      const ratio = reward / risk
      return ratio.toFixed(2)
    }
    return '0.00'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const trade = {
        symbol: formData.symbol.toUpperCase(),
        direction: formData.direction,
        entry_price: parseFloat(formData.entry_price),
        exit_price: parseFloat(formData.exit_price),
        quantity: parseInt(formData.quantity),
        entry_date: formData.entry_date,
        exit_date: formData.exit_date,
        commission: formData.commission ? parseFloat(formData.commission) : 0,
        strategy: formData.strategy || undefined,
        notes: formData.notes || undefined,
        rating: formData.rating,
        profit_target: formData.profit_target ? parseFloat(formData.profit_target) : undefined,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : undefined,
        initial_target: formData.initial_target ? parseFloat(formData.initial_target) : undefined,
        execution_quality: formData.execution_quality,
        emotions: formData.emotions.length > 0 ? formData.emotions : undefined
      }

      const result = await tradeService.createTrade(trade)
      
      if (result) {
        // Tag'leri ekle
        for (const tagId of selectedTags) {
          await tagService.addTagToTrade(result.id!, tagId)
        }
        router.push('/dashboard/trades')
      } else {
        setError('İşlem eklenirken hata oluştu')
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleEmotion = (emotion: string) => {
    setFormData(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }))
  }

  const riskAmount = calculateRisk()
  const rrRatio = calculateRRRatio()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/trades" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-4">
            <ArrowLeft size={20} />
            Geri Dön
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Yeni İşlem Ekle
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Detaylı trade analizi için tüm bilgileri girin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              📊 Temel Bilgiler
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Symbol & Direction */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sembol *
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="AAPL, TSLA, BTC/USD"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yön *
                </label>
                <select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                >
                  <option value="LONG">📈 LONG (Alış)</option>
                  <option value="SHORT">📉 SHORT (Satış)</option>
                </select>
              </div>

              {/* Entry & Exit Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Giriş Fiyatı * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="entry_price"
                  value={formData.entry_price}
                  onChange={handleChange}
                  placeholder="150.50"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Çıkış Fiyatı * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="exit_price"
                  value={formData.exit_price}
                  onChange={handleChange}
                  placeholder="155.75"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Quantity & Commission */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Adet *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Komisyon ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="commission"
                  value={formData.commission}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Risk Yönetimi */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="text-blue-600" size={24} />
              Risk Yönetimi
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Profit Target ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="profit_target"
                  value={formData.profit_target}
                  onChange={handleChange}
                  placeholder="160.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="stop_loss"
                  value={formData.stop_loss}
                  onChange={handleChange}
                  placeholder="148.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Initial Target ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="initial_target"
                  value={formData.initial_target}
                  onChange={handleChange}
                  placeholder="155.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Risk Tutarı</p>
                <p className="text-2xl font-bold text-red-600">${riskAmount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Risk/Reward Oranı</p>
                <p className={`text-2xl font-bold ${parseFloat(rrRatio) >= 2 ? 'text-green-600' : parseFloat(rrRatio) >= 1 ? 'text-yellow-600' : 'text-red-600'}`}>
                  1:{rrRatio}
                </p>
              </div>
            </div>
          </div>

          {/* Performance & Quality */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              ⭐ Performans & Kalite
            </h2>
            
            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Trade Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-all hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-lg font-semibold text-slate-900 dark:text-white">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Execution Quality */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Execution Quality
                </label>
                <select
                  name="execution_quality"
                  value={formData.execution_quality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="excellent">🌟 Excellent - Mükemmel</option>
                  <option value="good">👍 Good - İyi</option>
                  <option value="average">😐 Average - Orta</option>
                  <option value="poor">👎 Poor - Kötü</option>
                </select>
              </div>

              {/* Emotions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Duygusal Durum (Birden fazla seçebilirsiniz)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion.value}
                      type="button"
                      onClick={() => toggleEmotion(emotion.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.emotions.includes(emotion.value)
                          ? emotion.color + ' ring-2 ring-blue-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {emotion.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Strategy */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              📅 Tarihler & Strateji
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Giriş Tarihi *
                </label>
                <input
                  type="datetime-local"
                  name="entry_date"
                  value={formData.entry_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Çıkış Tarihi *
                </label>
                <input
                  type="datetime-local"
                  name="exit_date"
                  value={formData.exit_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Strateji
                </label>
                <input
                  type="text"
                  name="strategy"
                  value={formData.strategy}
                  onChange={handleChange}
                  placeholder="Örn: Breakout, Trend Following, Scalping"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TagIcon className="text-blue-600" size={24} />
              Etiketler
            </h2>
            
            {availableTags.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Henüz etiket yok
                </p>
                <Link href="/dashboard/tags">
                  <button type="button" className="text-blue-600 hover:underline">
                    Etiket oluşturmak için tıklayın →
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Hatalar */}
                {availableTags.filter(t => t.category === 'mistake').length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-red-600 mb-3">❌ Hatalar</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(t => t.category === 'mistake')
                        .map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id!)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                              selectedTags.includes(tag.id!)
                                ? 'ring-2 ring-blue-500 scale-105'
                                : 'hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: selectedTags.includes(tag.id!) ? tag.color + '40' : tag.color + '20',
                              color: tag.color
                            }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Setup'lar */}
                {availableTags.filter(t => t.category === 'setup').length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 mb-3">📊 Setup'lar</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(t => t.category === 'setup')
                        .map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id!)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                              selectedTags.includes(tag.id!)
                                ? 'ring-2 ring-blue-500 scale-105'
                                : 'hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: selectedTags.includes(tag.id!) ? tag.color + '40' : tag.color + '20',
                              color: tag.color
                            }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Alışkanlıklar */}
                {availableTags.filter(t => t.category === 'habit').length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 mb-3">✅ Alışkanlıklar</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(t => t.category === 'habit')
                        .map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id!)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                              selectedTags.includes(tag.id!)
                                ? 'ring-2 ring-blue-500 scale-105'
                                : 'hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: selectedTags.includes(tag.id!) ? tag.color + '40' : tag.color + '20',
                              color: tag.color
                            }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {selectedTags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedTags.length} etiket seçildi
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              📝 Notlar
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              placeholder="İşlem hakkında detaylı notlarınız... Neden bu trade'i aldınız? Hangi sinyalleri gördünüz? Ne öğrendiniz?"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Kaydediliyor...' : '✅ İşlemi Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
