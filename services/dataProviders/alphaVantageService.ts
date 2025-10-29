// Alpha Vantage API Service - Forex ve Hisse Senetleri için
// Ücretsiz API Key gerekiyor: https://www.alphavantage.co/support/#api-key

import { Candle } from './binanceService'

interface AlphaVantageTimeSeriesData {
  [date: string]: {
    '1. open': string
    '2. high': string
    '3. low': string
    '4. close': string
    '5. volume': string
  }
}

class AlphaVantageService {
  private baseUrl = 'https://www.alphavantage.co/query'
  private apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'demo'

  /**
   * Forex paritelerinin listesi
   */
  getForexPairs(): string[] {
    return [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD',
      'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
    ]
  }

  /**
   * Popüler hisse senetleri
   */
  getPopularStocks(): string[] {
    return [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 
      'META', 'NVDA', 'JPM', 'V', 'WMT'
    ]
  }

  /**
   * Forex için günlük veri (1 dakikalık mumlar - sadece son 1-2 gün)
   */
  async getForexIntraday(
    fromCurrency: string,
    toCurrency: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '60min'
  ): Promise<Candle[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=${interval}&apikey=${this.apiKey}&outputsize=full`
      )
      const data = await response.json()

      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || 'API limit reached')
      }

      const timeSeries = data[`Time Series FX (${interval})`]
      if (!timeSeries) {
        throw new Error('No data available')
      }

      return Object.entries(timeSeries).map(([time, values]: [string, any]) => ({
        time: new Date(time).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: 0 // Forex'te volume yok
      })).reverse() // Eski -> Yeni sıralama
    } catch (error) {
      console.error('Alpha Vantage Forex error:', error)
      throw error
    }
  }

  /**
   * Forex için günlük veriler (daily)
   */
  async getForexDaily(
    fromCurrency: string,
    toCurrency: string,
    outputSize: 'compact' | 'full' = 'full'
  ): Promise<Candle[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&apikey=${this.apiKey}&outputsize=${outputSize}`
      )
      const data = await response.json()

      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || 'API limit reached')
      }

      const timeSeries = data['Time Series FX (Daily)']
      if (!timeSeries) {
        throw new Error('No data available')
      }

      return Object.entries(timeSeries).map(([time, values]: [string, any]) => ({
        time: new Date(time).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: 0
      })).reverse()
    } catch (error) {
      console.error('Alpha Vantage Forex Daily error:', error)
      throw error
    }
  }

  /**
   * Hisse senedi için günlük veri
   */
  async getStockIntraday(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '60min'
  ): Promise<Candle[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}&outputsize=full`
      )
      const data = await response.json()

      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || 'API limit reached')
      }

      const timeSeries = data[`Time Series (${interval})`]
      if (!timeSeries) {
        throw new Error('No data available')
      }

      return Object.entries(timeSeries).map(([time, values]: [string, any]) => ({
        time: new Date(time).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume'])
      })).reverse()
    } catch (error) {
      console.error('Alpha Vantage Stock error:', error)
      throw error
    }
  }

  /**
   * Hisse senedi için günlük veriler (daily)
   */
  async getStockDaily(
    symbol: string,
    outputSize: 'compact' | 'full' = 'full'
  ): Promise<Candle[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}&outputsize=${outputSize}`
      )
      const data = await response.json()

      if (data['Error Message'] || data['Note']) {
        throw new Error(data['Error Message'] || 'API limit reached')
      }

      const timeSeries = data['Time Series (Daily)']
      if (!timeSeries) {
        throw new Error('No data available')
      }

      return Object.entries(timeSeries).map(([time, values]: [string, any]) => ({
        time: new Date(time).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume'])
      })).reverse()
    } catch (error) {
      console.error('Alpha Vantage Stock Daily error:', error)
      throw error
    }
  }
}

export const alphaVantageService = new AlphaVantageService()

