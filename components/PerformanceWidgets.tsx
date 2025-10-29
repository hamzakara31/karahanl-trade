'use client'

import { useMemo } from 'react'
import { Trade } from '@/types'
import { TrendingUp, Target, Award, Activity } from 'lucide-react'

interface PerformanceWidgetsProps {
  trades: Trade[]
}

export default function PerformanceWidgets({ trades }: PerformanceWidgetsProps) {
  // Performans metriklerini hesapla
  const metrics = useMemo(() => {
    if (trades.length === 0) {
      return {
        winRate: 0,
        profitFactor: 0,
        expectancy: 0,
        zellaScore: 0,
        avgWin: 0,
        avgLoss: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalTrades: 0,
        netProfit: 0
      }
    }

    const winningTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl < 0)
    
    const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
    
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
    
    const winRate = (winningTrades.length / trades.length) * 100
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0
    const expectancy = avgWin * (winRate / 100) - avgLoss * (1 - winRate / 100)
    
    // Zella Score hesaplama (0-100 arası)
    // Factors: Win Rate (30%), Profit Factor (25%), Expectancy (25%), Consistency (20%)
    const winRateScore = Math.min(winRate / 65 * 30, 30) // 65% hedef
    const profitFactorScore = Math.min(profitFactor / 2 * 25, 25) // 2.0 hedef
    const expectancyScore = Math.min((expectancy / 100) * 25, 25) // $100 hedef
    
    // Consistency: son 10 işlemin standart sapması
    const recentTrades = trades.slice(-10)
    const recentPnLs = recentTrades.map(t => t.pnl)
    const avgPnL = recentPnLs.reduce((sum, pnl) => sum + pnl, 0) / recentPnLs.length
    const variance = recentPnLs.reduce((sum, pnl) => sum + Math.pow(pnl - avgPnL, 2), 0) / recentPnLs.length
    const stdDev = Math.sqrt(variance)
    const consistencyScore = Math.max(0, 20 - (stdDev / avgPnL * 10)) // Düşük volatilite = yüksek puan
    
    const zellaScore = Math.min(100, winRateScore + profitFactorScore + expectancyScore + consistencyScore)
    
    return {
      winRate,
      profitFactor: isFinite(profitFactor) ? profitFactor : 0,
      expectancy,
      zellaScore,
      avgWin,
      avgLoss,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalTrades: trades.length,
      netProfit: totalWins - totalLosses
    }
  }, [trades])

  // Win Rate Chart Data (son 20 işlem)
  const recentPerformance = useMemo(() => {
    const recent = trades.slice(-20)
    return recent.map((trade, index) => ({
      index: index + 1,
      isWin: trade.pnl > 0,
      pnl: trade.pnl
    }))
  }, [trades])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value)
  }

  // Zella Score rengi
  const getZellaScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getZellaScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-blue-500 to-cyan-500'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Win Rate Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Win Rate
          </h3>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Target className="text-white" size={20} />
          </div>
        </div>

        {/* Win Rate Yüzdesi */}
        <div className="mb-4">
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {metrics.winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {metrics.winningTrades} kazanan / {metrics.totalTrades} işlem
          </div>
        </div>

        {/* Win Rate Bar */}
        <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${Math.min(metrics.winRate, 100)}%` }}
          />
        </div>

        {/* Recent Trades Pattern */}
        <div className="flex gap-1 flex-wrap">
          {recentPerformance.map((trade, index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded ${
                trade.isWin 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
              title={`${trade.isWin ? 'Kazanan' : 'Kaybeden'}: ${formatCurrency(trade.pnl)}`}
            />
          ))}
        </div>
      </div>

      {/* Trade Expectancy Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Trade Expectancy
          </h3>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Activity className="text-white" size={20} />
          </div>
        </div>

        {/* Expectancy Değeri */}
        <div className="mb-6">
          <div className={`text-4xl font-bold mb-2 ${
            metrics.expectancy >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(metrics.expectancy)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            İşlem başına beklenen kazanç
          </div>
        </div>

        {/* Avg Win vs Avg Loss */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Ortalama Kazanç</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(metrics.avgWin)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">Ortalama Kayıp</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(metrics.avgLoss)}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Profit Factor</span>
              <span className={`font-bold ${
                metrics.profitFactor >= 2 
                  ? 'text-green-600 dark:text-green-400' 
                  : metrics.profitFactor >= 1.5
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {metrics.profitFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zella Score Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Zella Score
          </h3>
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getZellaScoreBg(metrics.zellaScore)} flex items-center justify-center`}>
            <Award className="text-white" size={20} />
          </div>
        </div>

        {/* Zella Score Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Background Circle */}
            <svg className="transform -rotate-90" width="160" height="160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-200 dark:text-slate-800"
              />
              {/* Progress Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - metrics.zellaScore / 100)}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={metrics.zellaScore >= 80 ? 'text-green-500' : metrics.zellaScore >= 60 ? 'text-blue-500' : 'text-orange-500'} stopColor="currentColor" />
                  <stop offset="100%" className={metrics.zellaScore >= 80 ? 'text-emerald-500' : metrics.zellaScore >= 60 ? 'text-cyan-500' : 'text-red-500'} stopColor="currentColor" />
                </linearGradient>
              </defs>
            </svg>
            {/* Score Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getZellaScoreColor(metrics.zellaScore)}`}>
                  {metrics.zellaScore.toFixed(1)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  / 100
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Rating */}
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {metrics.zellaScore >= 80 
              ? '🏆 Mükemmel!' 
              : metrics.zellaScore >= 60 
              ? '✨ Çok İyi' 
              : metrics.zellaScore >= 40 
              ? '👍 İyi' 
              : '📈 Gelişiyor'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Trading performans puanın
          </div>
        </div>
      </div>
    </div>
  )
}

