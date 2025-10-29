// Binance API Service - Kripto verileri için
// Public API kullanıyor - API key gerektirmiyor

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BinanceKline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3'

  /**
   * Kripto sembollerinin listesini getir
   */
  async getSymbols(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/exchangeInfo`)
      const data = await response.json()
      
      // Sadece USDT paritelerini filtrele (en likit olanlar)
      const symbols = data.symbols
        .filter((s: any) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .map((s: any) => s.symbol)
        .slice(0, 50) // İlk 50 sembol
      
      return symbols
    } catch (error) {
      console.error('Binance symbols error:', error)
      return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']
    }
  }

  /**
   * Tarihi candlestick verilerini getir
   * @param symbol - Sembol (örn: BTCUSDT)
   * @param interval - Zaman aralığı (1m, 5m, 15m, 1h, 4h, 1d)
   * @param limit - Kaç mum (max 1000)
   * @param startTime - Başlangıç zamanı (ms)
   * @param endTime - Bitiş zamanı (ms)
   */
  async getHistoricalData(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' = '1h',
    limit: number = 500,
    startTime?: number,
    endTime?: number
  ): Promise<Candle[]> {
    try {
      const params = new URLSearchParams({
        symbol,
        interval,
        limit: limit.toString()
      })

      if (startTime) params.append('startTime', startTime.toString())
      if (endTime) params.append('endTime', endTime.toString())

      const response = await fetch(`${this.baseUrl}/klines?${params}`)
      const data: BinanceKline[] = await response.json()

      return data.map((kline: any) => ({
        time: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }))
    } catch (error) {
      console.error('Binance historical data error:', error)
      throw error
    }
  }

  /**
   * Belirli bir tarih aralığı için tüm verileri çek (1000'den fazla)
   */
  async getHistoricalDataRange(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w',
    startTime: number,
    endTime: number
  ): Promise<Candle[]> {
    const allCandles: Candle[] = []
    let currentStartTime = startTime

    while (currentStartTime < endTime) {
      const candles = await this.getHistoricalData(
        symbol,
        interval,
        1000,
        currentStartTime,
        endTime
      )

      if (candles.length === 0) break

      allCandles.push(...candles)
      currentStartTime = candles[candles.length - 1].time + 1
    }

    return allCandles
  }

  /**
   * Güncel fiyat bilgisi
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`)
      const data = await response.json()
      return parseFloat(data.price)
    } catch (error) {
      console.error('Binance price error:', error)
      throw error
    }
  }
}

export const binanceService = new BinanceService()

