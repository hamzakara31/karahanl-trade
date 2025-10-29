'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react'
import TradingChart from './TradingChart'
import { Candle } from '@/services/dataProviders/binanceService'

interface TradeReplayProps {
  candles: Candle[]
  entryPrice: number
  exitPrice: number
  entryTime: number
  exitTime: number
  direction: 'LONG' | 'SHORT'
  profitTarget?: number
  stopLoss?: number
}

export default function TradeReplay({
  candles,
  entryPrice,
  exitPrice,
  entryTime,
  exitTime,
  direction,
  profitTarget,
  stopLoss
}: TradeReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 4x speed
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Find entry and exit indices
  const entryIndex = candles.findIndex(c => c.time >= entryTime)
  const exitIndex = candles.findIndex(c => c.time >= exitTime)

  // Visible candles (from start to current index)
  const visibleCandles = candles.slice(0, currentIndex + 1)
  const currentCandle = candles[currentIndex]

  // Calculate current P&L
  const getCurrentPnL = () => {
    if (!currentCandle || currentIndex < entryIndex) return 0
    
    const currentPrice = currentCandle.close
    if (direction === 'LONG') {
      return ((currentPrice - entryPrice) / entryPrice) * 100
    } else {
      return ((entryPrice - currentPrice) / entryPrice) * 100
    }
  }

  const currentPnL = getCurrentPnL()

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentIndex < candles.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= candles.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000 / speed) // Adjust speed
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentIndex, candles.length, speed])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }

  const handleStepForward = () => {
    if (currentIndex < candles.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <TradingChart
          data={visibleCandles.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close
          }))}
          entryPrice={currentIndex >= entryIndex ? entryPrice : undefined}
          exitPrice={currentIndex >= exitIndex ? exitPrice : undefined}
          entryTime={currentIndex >= entryIndex ? entryTime : undefined}
          exitTime={currentIndex >= exitIndex ? exitTime : undefined}
          profitTarget={profitTarget}
          stopLoss={stopLoss}
          direction={direction}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Zaman</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {currentCandle ? formatDate(currentCandle.time) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Fiyat</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              ${currentCandle ? currentCandle.close.toFixed(2) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Durum</p>
            <p className="text-sm font-semibold">
              {currentIndex < entryIndex && (
                <span className="text-slate-500">Giriş Öncesi</span>
              )}
              {currentIndex >= entryIndex && currentIndex < exitIndex && (
                <span className="text-blue-600">Pozisyonda</span>
              )}
              {currentIndex >= exitIndex && (
                <span className="text-purple-600">Çıkış Yapıldı</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">P&L</p>
            <p className={`text-sm font-semibold ${
              currentPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentIndex >= entryIndex ? (
                `${currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}%`
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {/* Progress Bar */}
          <div className="flex-1 mr-4">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={candles.length - 1}
                value={currentIndex}
                onChange={(e) => {
                  setIsPlaying(false)
                  setCurrentIndex(Number(e.target.value))
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentIndex / (candles.length - 1)) * 100}%, #e2e8f0 ${(currentIndex / (candles.length - 1)) * 100}%, #e2e8f0 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{currentIndex + 1} / {candles.length}</span>
                <span>{((currentIndex / (candles.length - 1)) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleStepBackward}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentIndex >= candles.length - 1}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Speed Control */}
          <div className="ml-4 flex gap-1">
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Markers */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${
          currentIndex >= entryIndex 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Giriş</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                ${entryPrice.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatDate(entryTime)}
              </p>
            </div>
            {currentIndex >= entryIndex && (
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          currentIndex >= exitIndex 
            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500' 
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Çıkış</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                ${exitPrice.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatDate(exitTime)}
              </p>
            </div>
            {currentIndex >= exitIndex && (
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

