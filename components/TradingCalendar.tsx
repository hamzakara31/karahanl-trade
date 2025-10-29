'use client'

import { useState, useMemo } from 'react'
import { Trade } from '@/types'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

interface DayData {
  date: Date
  trades: Trade[]
  pnl: number
  pnlPercent: number
  isCurrentMonth: boolean
}

interface TradingCalendarProps {
  trades: Trade[]
}

export default function TradingCalendar({ trades }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Ay ve yıl değiştirme
  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1))
  }

  // Takvim verilerini hesapla
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Ayın ilk ve son günü
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Takvimin başlangıç günü (önceki aydan gösterilecek günler)
    const startDay = new Date(firstDay)
    startDay.setDate(startDay.getDate() - firstDay.getDay()) // Pazar'dan başla
    
    // Takvimin bitiş günü (sonraki aydan gösterilecek günler)
    const endDay = new Date(lastDay)
    endDay.setDate(endDay.getDate() + (6 - lastDay.getDay()))
    
    // Tüm günleri oluştur
    const days: DayData[] = []
    const current = new Date(startDay)
    
    while (current <= endDay) {
      const dateStr = current.toISOString().split('T')[0]
      
      // Bu güne ait trade'leri filtrele
      const dayTrades = trades.filter(trade => {
        const exitDate = new Date(trade.exit_date).toISOString().split('T')[0]
        return exitDate === dateStr
      })
      
      // P&L hesapla
      const pnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0)
      const totalInvested = dayTrades.reduce((sum, trade) => 
        sum + (trade.entry_price * (trade.quantity || 1)), 0
      )
      const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0
      
      days.push({
        date: new Date(current),
        trades: dayTrades,
        pnl,
        pnlPercent,
        isCurrentMonth: current.getMonth() === month
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [trades, currentDate])

  // Haftalık toplamları hesapla
  const weeklyTotals = useMemo(() => {
    const weeks: { pnl: number; trades: number; days: number }[] = []
    
    for (let i = 0; i < calendarData.length; i += 7) {
      const weekDays = calendarData.slice(i, i + 7)
      const weekPnl = weekDays.reduce((sum, day) => sum + day.pnl, 0)
      const weekTrades = weekDays.reduce((sum, day) => sum + day.trades.length, 0)
      const activeDays = weekDays.filter(day => day.trades.length > 0).length
      
      weeks.push({
        pnl: weekPnl,
        trades: weekTrades,
        days: activeDays
      })
    }
    
    return weeks
  }, [calendarData])

  // Aylık toplam
  const monthlyTotal = useMemo(() => {
    return calendarData
      .filter(day => day.isCurrentMonth)
      .reduce((sum, day) => sum + day.pnl, 0)
  }, [calendarData])

  const monthlyTrades = useMemo(() => {
    return calendarData
      .filter(day => day.isCurrentMonth)
      .reduce((sum, day) => sum + day.trades.length, 0)
  }, [calendarData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(value)
  }

  const weekDays = ['Pazar', 'Pzt', 'Salı', 'Çrş', 'Prş', 'Cuma', 'Cmt']
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {monthlyTrades} işlem
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Aylık Toplam */}
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Aylık P&L</p>
              <p className={`text-2xl font-bold ${
                monthlyTotal >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(monthlyTotal)}
              </p>
            </div>
            
            {/* Ay Navigasyonu */}
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Bugün
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-8 gap-2">
          {/* Hafta Günleri */}
          <div className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
            {/* Boş hücre hafta toplamı için */}
          </div>
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}

          {/* Günler */}
          {calendarData.map((day, index) => {
            // Her satırın başında haftalık toplam
            if (index % 7 === 0) {
              const weekIndex = Math.floor(index / 7)
              const week = weeklyTotals[weekIndex]
              
              return (
                <>
                  {/* Haftalık Toplam */}
                  <div 
                    key={`week-${weekIndex}`}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      H{weekIndex + 1}
                    </span>
                    <span className={`text-sm font-bold ${
                      week.pnl >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(week.pnl).replace('₺', '')}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {week.days}g
                    </span>
                  </div>
                  
                  {/* Günlük Hücre */}
                  <DayCell key={day.date.toISOString()} day={day} />
                </>
              )
            }
            
            return <DayCell key={day.date.toISOString()} day={day} />
          })}
        </div>
      </div>
    </div>
  )
}

// Günlük hücre component
function DayCell({ day }: { day: DayData }) {
  const hasTrades = day.trades.length > 0
  const isProfit = day.pnl > 0
  const isLoss = day.pnl < 0
  
  return (
    <div
      className={`
        relative min-h-[100px] p-3 rounded-lg border transition-all
        ${!day.isCurrentMonth ? 'opacity-40' : ''}
        ${hasTrades 
          ? isProfit 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }
        cursor-pointer
      `}
    >
      {/* Gün numarası */}
      <div className="text-sm font-medium text-slate-900 dark:text-white mb-2">
        {day.date.getDate()}
      </div>

      {/* Trade bilgisi */}
      {hasTrades && (
        <div className="space-y-1">
          {/* P&L */}
          <div className={`text-sm font-bold ${
            isProfit 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(day.pnl)}
          </div>

          {/* Trade sayısı */}
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {day.trades.length} işlem
          </div>

          {/* Yüzde */}
          <div className={`text-xs font-medium ${
            isProfit 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {day.pnlPercent > 0 ? '+' : ''}{day.pnlPercent.toFixed(2)}%
          </div>

          {/* Win/Loss indicator */}
          <div className="absolute top-2 right-2">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

