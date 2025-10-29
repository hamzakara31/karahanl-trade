import { Candle } from '../dataProviders/binanceService'

export interface BacktestTrade {
  entryTime: number
  exitTime: number
  entryPrice: number
  exitPrice: number
  direction: 'LONG' | 'SHORT'
  pnl: number
  pnlPercent: number
  quantity: number
}

export interface BacktestResult {
  trades: BacktestTrade[]
  metrics: {
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
    maxDrawdown: number
    maxDrawdownPercent: number
    sharpeRatio: number
  }
  equityCurve: { time: number; equity: number }[]
}

export interface Strategy {
  name: string
  type: 'SMA_CROSS' | 'RSI' | 'MACD' | 'BOLLINGER' | 'CUSTOM'
  parameters: any
}

export class BacktestEngine {
  private initialCapital: number
  private commission: number // Komisyon yüzdesi (0.001 = %0.1)

  constructor(initialCapital: number = 10000, commission: number = 0.001) {
    this.initialCapital = initialCapital
    this.commission = commission
  }

  /**
   * Stratejiyi backtest et
   */
  runBacktest(candles: Candle[], strategy: Strategy): BacktestResult {
    const signals = this.generateSignals(candles, strategy)
    const trades = this.executeTrades(candles, signals)
    const metrics = this.calculateMetrics(trades)
    const equityCurve = this.calculateEquityCurve(trades)

    return {
      trades,
      metrics,
      equityCurve
    }
  }

  /**
   * Strateji sinyallerini üret
   */
  private generateSignals(candles: Candle[], strategy: Strategy): ('BUY' | 'SELL' | 'HOLD')[] {
    switch (strategy.type) {
      case 'SMA_CROSS':
        return this.smaCrossStrategy(candles, strategy.parameters)
      case 'RSI':
        return this.rsiStrategy(candles, strategy.parameters)
      case 'MACD':
        return this.macdStrategy(candles, strategy.parameters)
      default:
        return candles.map(() => 'HOLD')
    }
  }

  /**
   * SMA Crossover Stratejisi
   */
  private smaCrossStrategy(
    candles: Candle[],
    params: { fastPeriod: number; slowPeriod: number }
  ): ('BUY' | 'SELL' | 'HOLD')[] {
    const { fastPeriod, slowPeriod } = params
    const signals: ('BUY' | 'SELL' | 'HOLD')[] = []

    const fastSMA = this.calculateSMA(candles.map(c => c.close), fastPeriod)
    const slowSMA = this.calculateSMA(candles.map(c => c.close), slowPeriod)

    for (let i = 0; i < candles.length; i++) {
      if (i < slowPeriod) {
        signals.push('HOLD')
        continue
      }

      const prevFast = fastSMA[i - 1]
      const prevSlow = slowSMA[i - 1]
      const currFast = fastSMA[i]
      const currSlow = slowSMA[i]

      // Golden Cross (Fast SMA crosses above Slow SMA)
      if (prevFast <= prevSlow && currFast > currSlow) {
        signals.push('BUY')
      }
      // Death Cross (Fast SMA crosses below Slow SMA)
      else if (prevFast >= prevSlow && currFast < currSlow) {
        signals.push('SELL')
      }
      else {
        signals.push('HOLD')
      }
    }

    return signals
  }

  /**
   * RSI Stratejisi
   */
  private rsiStrategy(
    candles: Candle[],
    params: { period: number; oversold: number; overbought: number }
  ): ('BUY' | 'SELL' | 'HOLD')[] {
    const { period, oversold, overbought } = params
    const signals: ('BUY' | 'SELL' | 'HOLD')[] = []
    const rsi = this.calculateRSI(candles.map(c => c.close), period)

    for (let i = 0; i < candles.length; i++) {
      if (i < period) {
        signals.push('HOLD')
        continue
      }

      const currentRSI = rsi[i]
      const prevRSI = rsi[i - 1]

      // RSI crosses above oversold level
      if (prevRSI <= oversold && currentRSI > oversold) {
        signals.push('BUY')
      }
      // RSI crosses below overbought level
      else if (prevRSI >= overbought && currentRSI < overbought) {
        signals.push('SELL')
      }
      else {
        signals.push('HOLD')
      }
    }

    return signals
  }

  /**
   * MACD Stratejisi
   */
  private macdStrategy(
    candles: Candle[],
    params: { fastPeriod: number; slowPeriod: number; signalPeriod: number }
  ): ('BUY' | 'SELL' | 'HOLD')[] {
    const { fastPeriod, slowPeriod, signalPeriod } = params
    const signals: ('BUY' | 'SELL' | 'HOLD')[] = []
    
    const prices = candles.map(c => c.close)
    const { macd, signal } = this.calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod)

    for (let i = 0; i < candles.length; i++) {
      if (i < slowPeriod + signalPeriod) {
        signals.push('HOLD')
        continue
      }

      const prevMACD = macd[i - 1]
      const prevSignal = signal[i - 1]
      const currMACD = macd[i]
      const currSignal = signal[i]

      // MACD crosses above signal line
      if (prevMACD <= prevSignal && currMACD > currSignal) {
        signals.push('BUY')
      }
      // MACD crosses below signal line
      else if (prevMACD >= prevSignal && currMACD < currSignal) {
        signals.push('SELL')
      }
      else {
        signals.push('HOLD')
      }
    }

    return signals
  }

  /**
   * Sinyallere göre işlemleri gerçekleştir
   */
  private executeTrades(candles: Candle[], signals: ('BUY' | 'SELL' | 'HOLD')[]): BacktestTrade[] {
    const trades: BacktestTrade[] = []
    let position: { entry: number; entryPrice: number; direction: 'LONG' | 'SHORT' } | null = null

    for (let i = 0; i < signals.length; i++) {
      const signal = signals[i]
      const candle = candles[i]

      // Pozisyon yokken BUY sinyali
      if (!position && signal === 'BUY') {
        position = {
          entry: candle.time,
          entryPrice: candle.close,
          direction: 'LONG'
        }
      }
      // LONG pozisyon varken SELL sinyali
      else if (position && position.direction === 'LONG' && signal === 'SELL') {
        const exitPrice = candle.close
        const pnl = (exitPrice - position.entryPrice) * (1 - this.commission * 2) // Entry + Exit commission
        const pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100

        trades.push({
          entryTime: position.entry,
          exitTime: candle.time,
          entryPrice: position.entryPrice,
          exitPrice,
          direction: position.direction,
          pnl,
          pnlPercent,
          quantity: 1
        })

        position = null
      }
    }

    return trades
  }

  /**
   * Metrikleri hesapla
   */
  private calculateMetrics(trades: BacktestTrade[]): BacktestResult['metrics'] {
    const winningTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl < 0)

    const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
      averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
      maxDrawdown: this.calculateMaxDrawdown(trades).maxDrawdown,
      maxDrawdownPercent: this.calculateMaxDrawdown(trades).maxDrawdownPercent,
      sharpeRatio: this.calculateSharpeRatio(trades)
    }
  }

  /**
   * Equity curve hesapla
   */
  private calculateEquityCurve(trades: BacktestTrade[]): { time: number; equity: number }[] {
    const curve: { time: number; equity: number }[] = []
    let equity = this.initialCapital

    curve.push({ time: trades[0]?.exitTime || Date.now(), equity })

    for (const trade of trades) {
      equity += trade.pnl
      curve.push({ time: trade.exitTime, equity })
    }

    return curve
  }

  /**
   * Max Drawdown hesapla
   */
  private calculateMaxDrawdown(trades: BacktestTrade[]): { maxDrawdown: number; maxDrawdownPercent: number } {
    let peak = this.initialCapital
    let maxDrawdown = 0
    let maxDrawdownPercent = 0
    let equity = this.initialCapital

    for (const trade of trades) {
      equity += trade.pnl

      if (equity > peak) {
        peak = equity
      }

      const drawdown = peak - equity
      const drawdownPercent = (drawdown / peak) * 100

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = drawdownPercent
      }
    }

    return { maxDrawdown, maxDrawdownPercent }
  }

  /**
   * Sharpe Ratio hesapla
   */
  private calculateSharpeRatio(trades: BacktestTrade[]): number {
    if (trades.length === 0) return 0

    const returns = trades.map(t => t.pnlPercent)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)

    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // 252 = trading days per year
  }

  // ==================== TECHNICAL INDICATORS ====================

  /**
   * Simple Moving Average
   */
  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = []

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(0)
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
        sma.push(sum / period)
      }
    }

    return sma
  }

  /**
   * Exponential Moving Average
   */
  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = []
    const multiplier = 2 / (period + 1)

    // İlk EMA değeri SMA
    const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
    ema.push(firstSMA)

    for (let i = 1; i < prices.length; i++) {
      const value = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
      ema.push(value)
    }

    return ema
  }

  /**
   * RSI (Relative Strength Index)
   */
  private calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = []
    const gains: number[] = []
    const losses: number[] = []

    // İlk gain/loss hesapla
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    for (let i = 0; i < prices.length; i++) {
      if (i < period) {
        rsi.push(50) // Default
      } else {
        const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
        const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period
        
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
        rsi.push(100 - (100 / (1 + rs)))
      }
    }

    return rsi
  }

  /**
   * MACD (Moving Average Convergence Divergence)
   */
  private calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { macd: number[]; signal: number[]; histogram: number[] } {
    const fastEMA = this.calculateEMA(prices, fastPeriod)
    const slowEMA = this.calculateEMA(prices, slowPeriod)
    
    const macd = fastEMA.map((fast, i) => fast - slowEMA[i])
    const signal = this.calculateEMA(macd, signalPeriod)
    const histogram = macd.map((m, i) => m - signal[i])

    return { macd, signal, histogram }
  }
}

