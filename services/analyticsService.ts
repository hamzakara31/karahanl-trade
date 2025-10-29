import { Trade } from '@/types'

export interface TradingMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  totalLoss: number
  netProfit: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  largestWin: number
  largestLoss: number
}

export const analyticsService = {
  calculateMetrics(trades: Trade[]): TradingMetrics {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0
      }
    }

    const winningTrades = trades.filter(t => (t.profit_loss || 0) > 0)
    const losingTrades = trades.filter(t => (t.profit_loss || 0) < 0)

    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0))

    const averageWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0

    const largestWin = winningTrades.length > 0 
      ? Math.max(...winningTrades.map(t => t.profit_loss || 0)) 
      : 0

    const largestLoss = losingTrades.length > 0 
      ? Math.min(...losingTrades.map(t => t.profit_loss || 0)) 
      : 0

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss
    }
  },

  // Günlük P&L grafiği için veri hazırlama
  getDailyProfitLoss(trades: Trade[]): { date: string; profit: number }[] {
    const dailyData: { [key: string]: number } = {}

    trades.forEach(trade => {
      const date = new Date(trade.exit_date).toLocaleDateString('tr-TR')
      if (!dailyData[date]) {
        dailyData[date] = 0
      }
      dailyData[date] += (trade.profit_loss || 0)
    })

    return Object.entries(dailyData)
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7) // Son 7 gün
  },

  // Sembol bazında performans
  getPerformanceBySymbol(trades: Trade[]): { symbol: string; profit: number; count: number }[] {
    const symbolData: { [key: string]: { profit: number; count: number } } = {}

    trades.forEach(trade => {
      if (!symbolData[trade.symbol]) {
        symbolData[trade.symbol] = { profit: 0, count: 0 }
      }
      symbolData[trade.symbol].profit += (trade.profit_loss || 0)
      symbolData[trade.symbol].count += 1
    })

    return Object.entries(symbolData)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5) // En iyi 5 sembol
  }
}

