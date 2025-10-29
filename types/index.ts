export interface Trade {
  id?: string
  user_id?: string
  account_id?: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  entry_price: number
  exit_price: number
  quantity: number
  entry_date: string
  exit_date: string
  pnl?: number  // P&L from database
  profit_loss?: number
  profit_loss_percent?: number
  commission?: number
  strategy?: string
  notes?: string
  tags?: string[]
  created_at?: string
  // Yeni alanlar
  rating?: number
  profit_target?: number
  stop_loss?: number
  initial_target?: number
  mae?: number  // Maximum Adverse Excursion
  mfe?: number  // Maximum Favorable Excursion
  contracts?: number
  execution_quality?: string
  emotions?: string[]
  screenshots?: string[]
}

export interface TradingAccount {
  id: string
  user_id: string
  account_name: string
  broker?: string
  balance: number
  created_at: string
}

export interface Journal {
  id?: string
  user_id?: string
  date: string
  market_conditions?: string
  emotional_state?: string
  lessons_learned?: string
  wins?: string
  losses?: string
  improvement_areas?: string
  tomorrow_plan?: string
  screenshots?: string[]
  created_at?: string
  updated_at?: string
}

export interface Tag {
  id?: string
  user_id?: string
  name: string
  category: 'mistake' | 'setup' | 'habit'
  color?: string
  description?: string
  created_at?: string
}

export interface TradeTag {
  id?: string
  trade_id: string
  tag_id: string
  created_at?: string
}

