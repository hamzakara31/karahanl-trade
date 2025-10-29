'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Calendar,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { tradeService } from '@/services/tradeService'
import { analyticsService } from '@/services/analyticsService'
import { demoDataService } from '@/services/demoDataService'
import { Trade } from '@/types'
import TradingCalendar from '@/components/TradingCalendar'
import PerformanceWidgets from '@/components/PerformanceWidgets'

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'stats' | 'calendar'>('stats')
  const [showDemoMenu, setShowDemoMenu] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await tradeService.getTrades()
    setTrades(data)
    setLoading(false)
  }

  const handleAddDemoData = async () => {
    setDemoLoading(true)
    const result = await demoDataService.addDemoData(50)
    if (result.success) {
      await loadData()
      alert(`✅ ${result.count} demo işlem eklendi!`)
    } else {
      alert('❌ Demo veri eklenirken hata oluştu.')
    }
    setDemoLoading(false)
    setShowDemoMenu(false)
  }

  const handleClearAllData = async () => {
    if (!confirm('⚠️ TÜM İŞLEMLER SİLİNECEK! Emin misin?')) return
    
    setDemoLoading(true)
    const result = await demoDataService.clearAllData()
    if (result.success) {
      await loadData()
      alert(`✅ ${result.count} işlem silindi.`)
    } else {
      alert('❌ Veriler silinirken hata oluştu.')
    }
    setDemoLoading(false)
    setShowDemoMenu(false)
  }

  // Metrikleri hesapla
  const metrics = analyticsService.calculateMetrics(trades)
  const performanceData = analyticsService.getDailyProfitLoss(trades)

  // Stats kartları için veri
  const stats = [
    {
      title: 'Net Kâr',
      value: `$${metrics.netProfit.toFixed(2)}`,
      change: metrics.netProfit >= 0 ? '+' : '-',
      isPositive: metrics.netProfit >= 0,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      change: `${metrics.winningTrades}/${metrics.totalTrades}`,
      isPositive: metrics.winRate >= 50,
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Toplam İşlem',
      value: metrics.totalTrades.toString(),
      change: `W: ${metrics.winningTrades} L: ${metrics.losingTrades}`,
      isPositive: true,
      icon: Activity,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Ortalama Kâr',
      value: `$${metrics.averageWin.toFixed(2)}`,
      change: `En Büyük: $${metrics.largestWin.toFixed(2)}`,
      isPositive: metrics.averageWin > 0,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Trading performansınızın özeti
              </p>
            </div>
            
            <div className="flex gap-4">
              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'stats'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📊 İstatistikler
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📅 Takvim
                </button>
              </div>

              {/* Time Range (only for stats view) */}
              {viewMode === 'stats' && (
                <div className="flex gap-2">
                  {['7d', '30d', '90d', '1y'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        timeRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}

              {/* Demo Data Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  className="px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center gap-2"
                  disabled={demoLoading}
                >
                  {demoLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>🎲 Demo Data</>
                  )}
                </button>

                {/* Demo Menu Dropdown */}
                {showDemoMenu && !demoLoading && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                        Demo Data Yönetimi
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={handleAddDemoData}
                          className="w-full text-left px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                        >
                          ✅ 50 Demo İşlem Ekle
                        </button>
                        <button
                          onClick={handleClearAllData}
                          className="w-full text-left px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                        >
                          🗑️ Tüm İşlemleri Sil
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                        Test için demo veri ekleyebilir veya tüm verileri temizleyebilirsin.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === 'calendar' ? (
          <TradingCalendar trades={trades} />
        ) : (
          <>
            {/* Performance Widgets */}
            <PerformanceWidgets trades={trades} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <span className={`text-sm font-semibold ${
                        stat.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Performans Grafiği
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Son 7 günlük kâr/zarar durumu
                  </p>
                </div>
                <BarChart3 className="text-blue-600" size={24} />
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fill="url(#colorProfit)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Trades & Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Trades */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Son İşlemler
                </h2>
                <div className="space-y-3">
                  {trades.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Henüz işlem yok
                      </p>
                      <a href="/dashboard/trades/new" className="text-blue-600 hover:underline text-sm">
                        İlk işlemi ekle →
                      </a>
                    </div>
                  ) : (
                    trades.slice(0, 5).map((trade) => (
                      <div 
                        key={trade.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            (trade.profit_loss || 0) >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {(trade.profit_loss || 0) >= 0 ? (
                              <TrendingUp className="text-green-600" size={20} />
                            ) : (
                              <TrendingDown className="text-red-600" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {trade.symbol} {trade.direction}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(trade.exit_date).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            (trade.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(trade.profit_loss || 0) >= 0 ? '+' : ''}${(trade.profit_loss || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {(trade.profit_loss_percent || 0) >= 0 ? '+' : ''}{(trade.profit_loss_percent || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Hızlı İşlemler
                </h2>
                <div className="space-y-3">
                  <a href="/dashboard/trades/new" className="block w-full">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
                      + Yeni İşlem Ekle
                    </button>
                  </a>
                  <a href="/dashboard/trades" className="block w-full">
                    <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                      📊 Tüm İşlemler
                    </button>
                  </a>
                  <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    🎯 Profit Factor: {metrics.profitFactor.toFixed(2)}
                  </button>
                  <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    💰 Avg Loss: ${metrics.averageLoss.toFixed(2)}
                  </button>
                </div>

                {/* Weekly Goal */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Performans Özeti
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Toplam Kazanç</span>
                      <span className="font-semibold text-green-600">
                        ${metrics.totalProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Toplam Kayıp</span>
                      <span className="font-semibold text-red-600">
                        -${metrics.totalLoss.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">Net P&L</span>
                      <span className={`font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.netProfit >= 0 ? '+' : ''}${metrics.netProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

