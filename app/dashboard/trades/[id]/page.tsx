'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { tradeService } from '@/services/tradeService'
import { tagService } from '@/services/tagService'
import { Trade, Tag } from '@/types'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Target, Star, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import TradingChart from '@/components/TradingChart'

// Demo chart data generator
const generateDemoChartData = (entryPrice: number, exitPrice: number, entryDate: string, exitDate: string) => {
  const data = []
  const start = new Date(entryDate).getTime()
  const end = new Date(exitDate).getTime()
  const duration = end - start
  
  // Eğer aynı gün içindeyse, saat bazında mum oluştur
  const isIntraday = duration < 24 * 60 * 60 * 1000
  const points = isIntraday ? 50 : Math.min(Math.ceil(duration / (24 * 60 * 60 * 1000)), 50)
  const interval = duration / points

  let currentPrice = entryPrice * 0.98
  
  for (let i = 0; i < points; i++) {
    const timestamp = start + (interval * i)
    const date = new Date(timestamp)
    
    // Unique time - tarih veya tarih+saat
    const time = isIntraday 
      ? Math.floor(timestamp / 1000) // Unix timestamp (saniye)
      : date.toISOString().split('T')[0] // Sadece tarih
    
    const volatility = entryPrice * 0.005
    const trend = (exitPrice - entryPrice) / points
    
    currentPrice += trend + (Math.random() - 0.5) * volatility
    
    const open = currentPrice
    const close = currentPrice + (Math.random() - 0.5) * volatility
    const high = Math.max(open, close) + Math.random() * volatility / 2
    const low = Math.min(open, close) - Math.random() * volatility / 2
    
    data.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    })
  }
  
  // Unique zamanları garanti et ve sırala
  const uniqueData = data.filter((item, index, self) =>
    index === self.findIndex((t) => t.time === item.time)
  )
  
  // Sort by time (ascending order)
  return uniqueData.sort((a, b) => {
    const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time
    const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time
    return timeA - timeB
  })
}

export default function TradeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tradeId = params.id as string
  
  const [trade, setTrade] = useState<Trade | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    loadTrade()
  }, [tradeId])

  const loadTrade = async () => {
    setLoading(true)
    const trades = await tradeService.getTrades()
    const foundTrade = trades.find(t => t.id === tradeId)
    
    if (foundTrade) {
      setTrade(foundTrade)
      
      // Tag'leri yükle
      const tradeTags = await tagService.getTradeTagsWithDetails(tradeId)
      setTags(tradeTags)
      
      // Demo chart data oluştur
      const data = generateDemoChartData(
        foundTrade.entry_price,
        foundTrade.exit_price,
        foundTrade.entry_date,
        foundTrade.exit_date
      )
      setChartData(data)
    }
    
    setLoading(false)
  }

  const handleDelete = async () => {
    if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      const success = await tradeService.deleteTrade(tradeId)
      if (success) {
        router.push('/dashboard/trades')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            İşlem bulunamadı
          </h1>
          <Link href="/dashboard/trades">
            <button className="text-blue-600 hover:underline">
              İşlemlere dön →
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const isProfit = (trade.profit_loss || 0) >= 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/trades" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-4">
            <ArrowLeft size={20} />
            İşlemlere Dön
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {trade.symbol} {trade.direction}
                </h1>
                {trade.rating && (
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < trade.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {formatDate(trade.entry_date)} - {formatDate(trade.exit_date)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* P&L Card */}
        <div className={`rounded-xl p-6 mb-8 ${
          isProfit 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
            : 'bg-gradient-to-r from-red-500 to-rose-500'
        }`}>
          <div className="text-white">
            <p className="text-lg mb-2">Kâr/Zarar</p>
            <div className="flex items-baseline gap-4">
              <h2 className="text-5xl font-bold">
                {formatCurrency(trade.profit_loss || 0)}
              </h2>
              <span className="text-2xl font-semibold">
                ({(trade.profit_loss_percent || 0) >= 0 ? '+' : ''}
                {(trade.profit_loss_percent || 0).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            📈 Trade Grafiği
          </h2>
          <TradingChart
            data={chartData}
            entryPrice={trade.entry_price}
            exitPrice={trade.exit_price}
            entryTime={chartData.length > 0 ? chartData[0].time : undefined}
            exitTime={chartData.length > 0 ? chartData[chartData.length - 1].time : undefined}
            profitTarget={trade.profit_target}
            stopLoss={trade.stop_loss}
            direction={trade.direction}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Giriş Fiyatı</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ${trade.entry_price}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Çıkış Fiyatı</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ${trade.exit_price}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Adet</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {trade.quantity}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Komisyon</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ${trade.commission || 0}
            </p>
          </div>

          {trade.profit_target && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-green-600 mb-1">🎯 Profit Target</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${trade.profit_target}
              </p>
            </div>
          )}

          {trade.stop_loss && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-red-600 mb-1">🛑 Stop Loss</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${trade.stop_loss}
              </p>
            </div>
          )}

          {trade.strategy && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Strateji</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {trade.strategy}
              </p>
            </div>
          )}

          {trade.execution_quality && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Execution Quality</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {trade.execution_quality}
              </p>
            </div>
          )}
        </div>

        {/* Tags & Emotions */}
        {(tags.length > 0 || (trade.emotions && trade.emotions.length > 0)) && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              🏷️ Etiketler & Duygular
            </h2>
            
            {tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color
                      }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {trade.emotions && trade.emotions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Duygular</h3>
                <div className="flex flex-wrap gap-2">
                  {trade.emotions.map((emotion, idx) => (
                    <span key={idx} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-sm rounded-lg font-medium">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {trade.notes && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              📝 Notlar
            </h2>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {trade.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

