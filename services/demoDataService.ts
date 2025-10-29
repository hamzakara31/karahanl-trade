import { Trade } from '@/types'
import { supabase } from '@/lib/supabase'

// Demo trade data generator
const generateDemoTrades = (count: number = 50): Omit<Trade, 'id' | 'created_at'>[] => {
  const symbols = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'SPY', 'NVDA', 'MSFT', 'GOOGL']
  const directions: ('LONG' | 'SHORT')[] = ['LONG', 'SHORT']
  const strategies = ['Breakout', 'Trend Following', 'Mean Reversion', 'Scalping', 'Swing']
  const emotions = ['Confident', 'Anxious', 'Calm', 'Excited', 'Nervous', 'Disciplined']
  
  const trades: Omit<Trade, 'id' | 'created_at'>[] = []
  const today = new Date()
  
  for (let i = 0; i < count; i++) {
    // Rastgele tarih (son 90 gün)
    const daysAgo = Math.floor(Math.random() * 90)
    const entryDate = new Date(today)
    entryDate.setDate(entryDate.getDate() - daysAgo)
    
    // İşlem süresi (1 saat - 5 gün arası)
    const holdingHours = Math.floor(Math.random() * 120) + 1
    const exitDate = new Date(entryDate)
    exitDate.setHours(exitDate.getHours() + holdingHours)
    
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const direction = directions[Math.floor(Math.random() * directions.length)]
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]
    
    // Fiyatlar
    const entryPrice = parseFloat((Math.random() * 200 + 50).toFixed(2))
    const quantity = Math.floor(Math.random() * 100) + 10
    
    // Win rate ~60% için
    const isWinner = Math.random() < 0.60
    
    let exitPrice: number
    let stopLoss: number
    let profitTarget: number
    
    if (direction === 'LONG') {
      stopLoss = parseFloat((entryPrice * (1 - (Math.random() * 0.02 + 0.01))).toFixed(2))
      profitTarget = parseFloat((entryPrice * (1 + (Math.random() * 0.04 + 0.02))).toFixed(2))
      
      if (isWinner) {
        // Kazanan işlem - profit target'a yakın
        exitPrice = parseFloat((entryPrice * (1 + (Math.random() * 0.03 + 0.01))).toFixed(2))
      } else {
        // Kaybeden işlem - stop loss'a yakın
        exitPrice = parseFloat((entryPrice * (1 - (Math.random() * 0.015 + 0.005))).toFixed(2))
      }
    } else {
      // SHORT
      stopLoss = parseFloat((entryPrice * (1 + (Math.random() * 0.02 + 0.01))).toFixed(2))
      profitTarget = parseFloat((entryPrice * (1 - (Math.random() * 0.04 + 0.02))).toFixed(2))
      
      if (isWinner) {
        exitPrice = parseFloat((entryPrice * (1 - (Math.random() * 0.03 + 0.01))).toFixed(2))
      } else {
        exitPrice = parseFloat((entryPrice * (1 + (Math.random() * 0.015 + 0.005))).toFixed(2))
      }
    }
    
    // P&L hesaplama
    const pnl = direction === 'LONG' 
      ? (exitPrice - entryPrice) * quantity 
      : (entryPrice - exitPrice) * quantity
    
    const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100 * (direction === 'LONG' ? 1 : -1)
    
    // MAE & MFE (simüle)
    const mae = parseFloat((Math.random() * Math.abs(pnl) * 0.3).toFixed(2))
    const mfe = parseFloat((Math.random() * Math.abs(pnl) * 1.5).toFixed(2))
    
    trades.push({
      symbol,
      direction,
      entry_price: entryPrice,
      exit_price: exitPrice,
      quantity,
      entry_date: entryDate.toISOString(),
      exit_date: exitDate.toISOString(),
      pnl: parseFloat(pnl.toFixed(2)),
      profit_loss: parseFloat(pnl.toFixed(2)),
      profit_loss_percent: parseFloat(pnlPercent.toFixed(2)),
      strategy,
      notes: `Demo işlem - ${strategy} stratejisi`,
      rating: Math.floor(Math.random() * 5) + 1,
      profit_target: profitTarget,
      stop_loss: stopLoss,
      initial_target: profitTarget,
      mae,
      mfe,
      contracts: quantity,
      execution_quality: (Math.floor(Math.random() * 5) + 1).toString(),
      emotions: [emotions[Math.floor(Math.random() * emotions.length)]],
      user_id: '' // Will be set when inserting
    })
  }
  
  return trades
}

export const demoDataService = {
  // Demo veri ekle
  async addDemoData(count: number = 50) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      const demoTrades = generateDemoTrades(count).map(trade => ({
        ...trade,
        user_id: user.id
      }))
      
      const { data, error } = await supabase
        .from('trades')
        .insert(demoTrades)
        .select()
      
      if (error) throw error
      
      return { success: true, count: data?.length || 0 }
    } catch (error) {
      console.error('Error adding demo data:', error)
      return { success: false, error }
    }
  },
  
  // Tüm verileri temizle
  async clearAllData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      // Önce trade'lerin sayısını al
      const { count } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      // Tüm trade'leri sil
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', user.id)
      
      if (error) throw error
      
      return { success: true, count: count || 0 }
    } catch (error) {
      console.error('Error clearing data:', error)
      return { success: false, error }
    }
  },
  
  // Demo veri var mı kontrol et
  async hasDemoData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      
      const { count } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .contains('notes', 'Demo işlem')
      
      return (count || 0) > 0
    } catch (error) {
      console.error('Error checking demo data:', error)
      return false
    }
  }
}

