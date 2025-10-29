import { supabase } from '@/lib/supabase'
import { Trade } from '@/types'

export const tradeService = {
  // P&L hesaplama
  calculateProfitLoss(
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    commission: number = 0
  ): { profitLoss: number; profitLossPercent: number } {
    let profitLoss = 0
    
    if (direction === 'LONG') {
      profitLoss = (exitPrice - entryPrice) * quantity
    } else {
      profitLoss = (entryPrice - exitPrice) * quantity
    }
    
    profitLoss -= commission
    
    const profitLossPercent = ((exitPrice - entryPrice) / entryPrice) * 100
    
    return { profitLoss, profitLossPercent }
  },

  // Trade ekleme
  async createTrade(trade: Trade): Promise<Trade | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı girişi gerekli')

      // P&L hesapla
      const { profitLoss, profitLossPercent } = this.calculateProfitLoss(
        trade.direction,
        trade.entry_price,
        trade.exit_price,
        trade.quantity,
        trade.commission || 0
      )

      const { data, error } = await supabase
        .from('trades')
        .insert([
          {
            user_id: user.id,
            ...trade,
            profit_loss: profitLoss,
            profit_loss_percent: profitLossPercent
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Trade ekleme hatası:', error)
      return null
    }
  },

  // Trade listesi getir
  async getTrades(): Promise<Trade[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Trade listesi hatası:', error)
      return []
    }
  },

  // Trade silme
  async deleteTrade(tradeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Trade silme hatası:', error)
      return false
    }
  }
}

