'use client'

import { useState, useEffect, useMemo } from 'react'
import { tradeService } from '@/services/tradeService'
import { tagService } from '@/services/tagService'
import { Trade, Tag } from '@/types'
import { Plus, TrendingUp, TrendingDown, Trash2, Calendar, DollarSign, Star, Filter, X } from 'lucide-react'
import Link from 'next/link'

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [tradeTags, setTradeTags] = useState<{ [key: string]: Tag[] }>({})
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [filterSymbol, setFilterSymbol] = useState('')
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL')
  const [filterResult, setFilterResult] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterStrategy, setFilterStrategy] = useState('')

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = async () => {
    setLoading(true)
    const data = await tradeService.getTrades()
    setTrades(data)
    
    // Her trade için tag'leri yükle
    const tagsMap: { [key: string]: Tag[] } = {}
    for (const trade of data) {
      const tags = await tagService.getTradeTagsWithDetails(trade.id!)
      tagsMap[trade.id!] = tags
    }
    setTradeTags(tagsMap)
    
    setLoading(false)
  }

  const handleDelete = async (tradeId: string) => {
    if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      const success = await tradeService.deleteTrade(tradeId)
      if (success) {
        loadTrades()
      }
    }
  }

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Symbol filter
      if (filterSymbol && !trade.symbol.toLowerCase().includes(filterSymbol.toLowerCase())) {
        return false
      }
      
      // Direction filter
      if (filterDirection !== 'ALL' && trade.direction !== filterDirection) {
        return false
      }
      
      // Result filter (Win/Loss)
      if (filterResult === 'WIN' && trade.pnl <= 0) {
        return false
      }
      if (filterResult === 'LOSS' && trade.pnl >= 0) {
        return false
      }
      
      // Date range filter
      if (filterDateFrom && new Date(trade.exit_date) < new Date(filterDateFrom)) {
        return false
      }
      if (filterDateTo && new Date(trade.exit_date) > new Date(filterDateTo)) {
        return false
      }
      
      // Strategy filter
      if (filterStrategy && trade.strategy && !trade.strategy.toLowerCase().includes(filterStrategy.toLowerCase())) {
        return false
      }
      
      return true
    })
  }, [trades, filterSymbol, filterDirection, filterResult, filterDateFrom, filterDateTo, filterStrategy])

  // Get unique symbols and strategies for dropdowns
  const uniqueSymbols = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.symbol)))
  }, [trades])

  const uniqueStrategies = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.strategy).filter(s => s)))
  }, [trades])

  const clearFilters = () => {
    setFilterSymbol('')
    setFilterDirection('ALL')
    setFilterResult('ALL')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterStrategy('')
  }

  const activeFilterCount = [
    filterSymbol,
    filterDirection !== 'ALL',
    filterResult !== 'ALL',
    filterDateFrom,
    filterDateTo,
    filterStrategy
  ].filter(Boolean).length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              İşlemlerim
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Tüm trading işlemleriniz
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Filter size={20} />
              Filtrele
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            <Link href="/dashboard/trades/import">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2">
                📥 İçe Aktar
              </button>
            </Link>
            
            <Link href="/dashboard/trades/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2">
                <Plus size={20} />
                Yeni İşlem
              </button>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                🔍 Filtreler
              </h3>
              <div className="flex gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Temizle
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Symbol Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sembol
                </label>
                <input
                  type="text"
                  placeholder="BTC, ETH, AAPL..."
                  value={filterSymbol}
                  onChange={(e) => setFilterSymbol(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Direction Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Yön
                </label>
                <select
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value as 'ALL' | 'LONG' | 'SHORT')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ALL">Tümü</option>
                  <option value="LONG">Long</option>
                  <option value="SHORT">Short</option>
                </select>
              </div>

              {/* Result Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sonuç
                </label>
                <select
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value as 'ALL' | 'WIN' | 'LOSS')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ALL">Tümü</option>
                  <option value="WIN">Kazanan</option>
                  <option value="LOSS">Kaybeden</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Strategy Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Strateji
                </label>
                <input
                  type="text"
                  placeholder="Scalping, Swing..."
                  value={filterStrategy}
                  onChange={(e) => setFilterStrategy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Filter Results Count */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{filteredTrades.length}</span> işlem bulundu
                {activeFilterCount > 0 && <span> ({activeFilterCount} filtre aktif)</span>}
              </p>
            </div>
          </div>
        )}

        {/* Trades List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : trades.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Henüz işlem yok
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              İlk trading işleminizi ekleyerek başlayın
            </p>
            <Link href="/dashboard/trades/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
                İlk İşlemi Ekle
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTrades.map((trade) => (
              <Link href={`/dashboard/trades/${trade.id}`} key={trade.id}>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Direction Badge */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        trade.direction === 'LONG' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {trade.direction === 'LONG' ? (
                          <TrendingUp className="text-green-600" size={24} />
                        ) : (
                          <TrendingDown className="text-red-600" size={24} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {trade.symbol} {trade.direction}
                          </h3>
                          {/* Rating Stars */}
                          {trade.rating && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < trade.rating! ? 'text-yellow-400' : 'text-slate-300'}>
                                  ⭐
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {trade.quantity} adet
                          </p>
                          {trade.strategy && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                              {trade.strategy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Giriş Fiyatı</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ${trade.entry_price}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Çıkış Fiyatı</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ${trade.exit_price}
                        </p>
                      </div>
                      {trade.profit_target && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">🎯 Profit Target</p>
                          <p className="font-semibold text-green-600">
                            ${trade.profit_target}
                          </p>
                        </div>
                      )}
                      {trade.stop_loss && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">🛑 Stop Loss</p>
                          <p className="font-semibold text-red-600">
                            ${trade.stop_loss}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Giriş Tarihi</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {formatDate(trade.entry_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Çıkış Tarihi</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {formatDate(trade.exit_date)}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {tradeTags[trade.id!] && tradeTags[trade.id!].length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tradeTags[trade.id!].map((tag) => (
                          <span
                            key={tag.id}
                            className="px-3 py-1 text-xs rounded-full flex items-center gap-1.5"
                            style={{
                              backgroundColor: tag.color + '20',
                              color: tag.color
                            }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Emotions Tags */}
                    {trade.emotions && trade.emotions.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {trade.emotions.map((emotion, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded-full">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    )}

                    {trade.notes && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {trade.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    {/* Profit/Loss */}
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        (trade.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(trade.profit_loss || 0)}
                      </p>
                      <p className={`text-sm font-semibold ${
                        (trade.profit_loss_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(trade.profit_loss_percent || 0) >= 0 ? '+' : ''}
                        {(trade.profit_loss_percent || 0).toFixed(2)}%
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(trade.id!)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="İşlemi sil"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

