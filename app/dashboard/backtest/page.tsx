'use client'

import { useState } from 'react'
import { binanceService } from '@/services/dataProviders/binanceService'
import { alphaVantageService } from '@/services/dataProviders/alphaVantageService'
import { BacktestEngine, Strategy, BacktestResult } from '@/services/backtesting/backtestEngine'
import { Play, Download, Settings, TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function BacktestPage() {
  const [dataSource, setDataSource] = useState<'binance' | 'alphavantage'>('binance')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState<'1h' | '4h' | '1d'>('1h')
  const [initialCapital, setInitialCapital] = useState(10000)
  const [commission, setCommission] = useState(0.001)
  
  const [strategy, setStrategy] = useState<Strategy>({
    name: 'SMA Crossover',
    type: 'SMA_CROSS',
    parameters: {
      fastPeriod: 10,
      slowPeriod: 20
    }
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)

  const handleRunBacktest = async () => {
    setLoading(true)
    try {
      // Veri çek
      let candles
      if (dataSource === 'binance') {
        candles = await binanceService.getHistoricalData(symbol, interval, 500)
      } else {
        // Alpha Vantage (Forex örneği)
        const [from, to] = symbol.split('/')
        if (interval === '1d') {
          candles = await alphaVantageService.getForexDaily(from || 'EUR', to || 'USD')
        } else {
          candles = await alphaVantageService.getForexIntraday(from || 'EUR', to || 'USD', '60min')
        }
      }

      // Backtest çalıştır
      const engine = new BacktestEngine(initialCapital, commission)
      const backtestResult = engine.runBacktest(candles, strategy)
      
      setResult(backtestResult)
    } catch (error: any) {
      alert(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            ⚡ Backtesting
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Stratejilerinizi geçmiş verilerde test edin
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings size={24} />
            Backtest Ayarları
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Source */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Veri Kaynağı
              </label>
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as 'binance' | 'alphavantage')}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="binance">Binance (Kripto)</option>
                <option value="alphavantage">Alpha Vantage (Forex/Hisse)</option>
              </select>
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sembol
              </label>
              {dataSource === 'binance' ? (
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="BNBUSDT">BNB/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="ADAUSDT">ADA/USDT</option>
                </select>
              ) : (
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="AUD/USD">AUD/USD</option>
                </select>
              )}
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Zaman Aralığı
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as '1h' | '4h' | '1d')}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="1h">1 Saat</option>
                <option value="4h">4 Saat</option>
                <option value="1d">1 Gün</option>
              </select>
            </div>

            {/* Initial Capital */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Başlangıç Sermayesi
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Commission */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Komisyon (%)
              </label>
              <input
                type="number"
                step="0.001"
                value={commission * 100}
                onChange={(e) => setCommission(Number(e.target.value) / 100)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Strateji
              </label>
              <select
                value={strategy.type}
                onChange={(e) => {
                  const type = e.target.value as Strategy['type']
                  if (type === 'SMA_CROSS') {
                    setStrategy({ name: 'SMA Crossover', type, parameters: { fastPeriod: 10, slowPeriod: 20 } })
                  } else if (type === 'RSI') {
                    setStrategy({ name: 'RSI', type, parameters: { period: 14, oversold: 30, overbought: 70 } })
                  } else if (type === 'MACD') {
                    setStrategy({ name: 'MACD', type, parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } })
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="SMA_CROSS">SMA Crossover</option>
                <option value="RSI">RSI</option>
                <option value="MACD">MACD</option>
              </select>
            </div>
          </div>

          {/* Strategy Parameters */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Strateji Parametreleri
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {strategy.type === 'SMA_CROSS' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Hızlı SMA Periyodu
                    </label>
                    <input
                      type="number"
                      value={strategy.parameters.fastPeriod}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        parameters: { ...strategy.parameters, fastPeriod: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Yavaş SMA Periyodu
                    </label>
                    <input
                      type="number"
                      value={strategy.parameters.slowPeriod}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        parameters: { ...strategy.parameters, slowPeriod: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}
              {strategy.type === 'RSI' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      RSI Periyodu
                    </label>
                    <input
                      type="number"
                      value={strategy.parameters.period}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        parameters: { ...strategy.parameters, period: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Oversold Seviyesi
                    </label>
                    <input
                      type="number"
                      value={strategy.parameters.oversold}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        parameters: { ...strategy.parameters, oversold: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Overbought Seviyesi
                    </label>
                    <input
                      type="number"
                      value={strategy.parameters.overbought}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        parameters: { ...strategy.parameters, overbought: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Run Button */}
          <div className="mt-6">
            <button
              onClick={handleRunBacktest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Backtest Çalışıyor...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Backtest Başlat
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Net Kâr</span>
                  <DollarSign className={result.metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'} size={20} />
                </div>
                <div className={`text-2xl font-bold ${result.metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(result.metrics.netProfit)}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Win Rate</span>
                  <Target className="text-blue-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.metrics.winRate.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {result.metrics.winningTrades}/{result.metrics.totalTrades} işlem
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Profit Factor</span>
                  <Activity className="text-purple-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isFinite(result.metrics.profitFactor) ? result.metrics.profitFactor.toFixed(2) : '∞'}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Max Drawdown</span>
                  <TrendingDown className="text-red-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {result.metrics.maxDrawdownPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatCurrency(result.metrics.maxDrawdown)}
                </div>
              </div>
            </div>

            {/* Equity Curve */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Equity Curve
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={result.equityCurve.map(point => ({
                  time: new Date(point.time).toLocaleDateString('tr-TR'),
                  equity: point.equity
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trade List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                İşlem Geçmişi ({result.trades.length} işlem)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Giriş</th>
                      <th className="text-left py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Çıkış</th>
                      <th className="text-left py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Yön</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Giriş Fiyat</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Çıkış Fiyat</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">P&L</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((trade, index) => (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 text-sm text-slate-900 dark:text-white">
                          {new Date(trade.entryTime).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 text-sm text-slate-900 dark:text-white">
                          {new Date(trade.exitTime).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            trade.direction === 'LONG' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="text-right py-3 text-sm text-slate-900 dark:text-white">
                          {formatCurrency(trade.entryPrice)}
                        </td>
                        <td className="text-right py-3 text-sm text-slate-900 dark:text-white">
                          {formatCurrency(trade.exitPrice)}
                        </td>
                        <td className={`text-right py-3 text-sm font-semibold ${
                          trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </td>
                        <td className={`text-right py-3 text-sm font-semibold ${
                          trade.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

