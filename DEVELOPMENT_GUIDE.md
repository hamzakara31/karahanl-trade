# 🚀 Geliştirme Rehberi

TradeZella benzeri trading platformu geliştirmek için detaylı adım adım rehber.

## 📚 İçindekiler

1. [Başlangıç](#başlangıç)
2. [Temel Kavramlar](#temel-kavramlar)
3. [Geliştirme Aşamaları](#geliştirme-aşamaları)
4. [Broker Entegrasyonları](#broker-entegrasyonları)
5. [Database Yapısı](#database-yapısı)
6. [API Geliştirme](#api-geliştirme)
7. [Güvenlik](#güvenlik)
8. [Deployment](#deployment)

---

## 🎯 Başlangıç

### Gerekli Bilgiler

#### Frontend Teknolojileri
- **React/Next.js**: Component-based UI
- **TypeScript**: Type safety
- **TailwindCSS**: Utility-first CSS
- **Framer Motion**: Animasyonlar

#### Backend Teknolojileri
- **Node.js**: Server-side JavaScript
- **PostgreSQL**: Relational database
- **Supabase**: Auth & Database
- **Redis**: Caching

#### Trading Bilgisi
- Trade terminolojisi (Long, Short, Entry, Exit, etc.)
- Broker API'ları
- Finansal hesaplamalar
- Risk yönetimi

---

## 🧩 Temel Kavramlar

### Trading Terimleri

```typescript
interface Trade {
  id: string
  userId: string
  symbol: string          // AAPL, TSLA, etc.
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  quantity: number
  entryDate: Date
  exitDate: Date
  profitLoss: number
  profitLossPercent: number
  commission: number
  strategy?: string
  notes?: string
  tags?: string[]
}
```

### Önemli Metrikler

1. **Win Rate**: (Kazanan işlemler / Toplam işlemler) × 100
2. **Profit Factor**: Toplam kazanç / Toplam kayıp
3. **Average Win/Loss**: Ortalama kazanç veya kayıp
4. **Max Drawdown**: En büyük düşüş
5. **Sharpe Ratio**: Risk-adjusted return

---

## 📋 Geliştirme Aşamaları

### Faz 1: Kimlik Doğrulama (1-2 Hafta)

#### Supabase Kurulumu
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

#### Supabase Client Oluşturma
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### Auth Context
```typescript
// context/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

### Faz 2: Database Schema (1 Hafta)

#### Supabase SQL

```sql
-- Users profile
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading accounts
CREATE TABLE trading_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  broker TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  balance DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES trading_accounts(id),
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL, -- LONG or SHORT
  entry_price DECIMAL(15, 4),
  exit_price DECIMAL(15, 4),
  quantity INTEGER,
  entry_date TIMESTAMP WITH TIME ZONE,
  exit_date TIMESTAMP WITH TIME ZONE,
  profit_loss DECIMAL(15, 2),
  profit_loss_percent DECIMAL(5, 2),
  commission DECIMAL(10, 2),
  strategy TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategies/Playbooks
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strategy performance tracking
CREATE TABLE strategy_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  followed_rules BOOLEAN,
  rule_violations TEXT[]
);

-- Indexes for better performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_entry_date ON trades(entry_date);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
```

---

### Faz 3: Trade CRUD İşlemleri (2 Hafta)

#### Trade Service
```typescript
// services/tradeService.ts
import { supabase } from '@/lib/supabase'

export interface CreateTradeInput {
  accountId: string
  symbol: string
  direction: 'LONG' | 'SHORT'
  entryPrice: number
  exitPrice: number
  quantity: number
  entryDate: Date
  exitDate: Date
  commission?: number
  strategy?: string
  notes?: string
  tags?: string[]
}

export const tradeService = {
  async createTrade(userId: string, input: CreateTradeInput) {
    // Calculate P&L
    const profitLoss = this.calculateProfitLoss(
      input.direction,
      input.entryPrice,
      input.exitPrice,
      input.quantity,
      input.commission || 0
    )

    const profitLossPercent = ((exitPrice - entryPrice) / entryPrice) * 100

    const { data, error } = await supabase
      .from('trades')
      .insert({
        user_id: userId,
        ...input,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTrades(userId: string, filters?: {
    startDate?: Date
    endDate?: Date
    symbol?: string
    strategy?: string
  }) {
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })

    if (filters?.startDate) {
      query = query.gte('entry_date', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
      query = query.lte('entry_date', filters.endDate.toISOString())
    }
    if (filters?.symbol) {
      query = query.eq('symbol', filters.symbol)
    }
    if (filters?.strategy) {
      query = query.eq('strategy', filters.strategy)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async updateTrade(tradeId: string, updates: Partial<CreateTradeInput>) {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTrade(tradeId: string) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)

    if (error) throw error
  },

  calculateProfitLoss(
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    commission: number
  ): number {
    let pl = 0
    
    if (direction === 'LONG') {
      pl = (exitPrice - entryPrice) * quantity
    } else {
      pl = (entryPrice - exitPrice) * quantity
    }
    
    return pl - commission
  }
}
```

---

### Faz 4: Analytics & Metriks (2-3 Hafta)

#### Analytics Service
```typescript
// services/analyticsService.ts
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
  averageHoldingPeriod: number
  maxDrawdown: number
}

export const analyticsService = {
  async calculateMetrics(trades: Trade[]): Promise<TradingMetrics> {
    const winningTrades = trades.filter(t => t.profit_loss > 0)
    const losingTrades = trades.filter(t => t.profit_loss < 0)

    const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit_loss, 0)
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit_loss, 0))

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      totalProfit,
      totalLoss,
      netProfit: totalProfit - totalLoss,
      profitFactor: totalProfit / totalLoss,
      averageWin: totalProfit / winningTrades.length,
      averageLoss: totalLoss / losingTrades.length,
      largestWin: Math.max(...winningTrades.map(t => t.profit_loss)),
      largestLoss: Math.min(...losingTrades.map(t => t.profit_loss)),
      averageHoldingPeriod: this.calculateAverageHoldingPeriod(trades),
      maxDrawdown: this.calculateMaxDrawdown(trades)
    }
  },

  calculateAverageHoldingPeriod(trades: Trade[]): number {
    const periods = trades.map(t => {
      const entry = new Date(t.entry_date).getTime()
      const exit = new Date(t.exit_date).getTime()
      return (exit - entry) / (1000 * 60 * 60 * 24) // days
    })
    return periods.reduce((sum, p) => sum + p, 0) / periods.length
  },

  calculateMaxDrawdown(trades: Trade[]): number {
    let peak = 0
    let maxDrawdown = 0
    let equity = 0

    trades.forEach(trade => {
      equity += trade.profit_loss
      if (equity > peak) peak = equity
      const drawdown = ((peak - equity) / peak) * 100
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })

    return maxDrawdown
  }
}
```

---

### Faz 5: Broker Entegrasyonları (3-4 Hafta)

#### MetaTrader 5 Örneği
```python
# Python backend for MT5 integration
import MetaTrader5 as mt5
from datetime import datetime
import json

class MT5Integration:
    def __init__(self):
        if not mt5.initialize():
            print("MT5 initialization failed")
            mt5.shutdown()
    
    def get_account_info(self):
        account_info = mt5.account_info()
        if account_info is None:
            return None
        
        return {
            'balance': account_info.balance,
            'equity': account_info.equity,
            'profit': account_info.profit,
            'margin': account_info.margin,
            'margin_free': account_info.margin_free
        }
    
    def get_deals_history(self, from_date, to_date):
        deals = mt5.history_deals_get(from_date, to_date)
        if deals is None:
            return []
        
        trades = []
        for deal in deals:
            trades.append({
                'ticket': deal.ticket,
                'symbol': deal.symbol,
                'type': 'LONG' if deal.type == mt5.DEAL_TYPE_BUY else 'SHORT',
                'volume': deal.volume,
                'price': deal.price,
                'profit': deal.profit,
                'commission': deal.commission,
                'time': datetime.fromtimestamp(deal.time)
            })
        
        return trades
    
    def sync_trades_to_database(self, user_id):
        # Get history
        from_date = datetime(2024, 1, 1)
        to_date = datetime.now()
        
        deals = self.get_deals_history(from_date, to_date)
        
        # Process and save to database
        # This would call your API endpoint
        return deals
```

#### API Endpoint
```typescript
// app/api/broker/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { broker, accountId } = await req.json()

  // Call Python backend or broker API
  const response = await fetch(`${process.env.PYTHON_API_URL}/sync/${broker}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, accountId })
  })

  const trades = await response.json()

  // Save to Supabase
  const { error } = await supabase
    .from('trades')
    .upsert(trades)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: trades.length })
}
```

---

### Faz 6: Backtesting (4-5 Hafta)

#### Backtesting Engine
```typescript
// services/backtestService.ts
interface BacktestResult {
  trades: Trade[]
  metrics: TradingMetrics
  equityCurve: { date: Date, equity: number }[]
}

export const backtestService = {
  async runBacktest(
    strategy: Strategy,
    symbol: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number
  ): Promise<BacktestResult> {
    // Get historical data
    const historicalData = await this.getHistoricalData(symbol, startDate, endDate)
    
    let equity = initialCapital
    const trades: Trade[] = []
    const equityCurve = []

    // Simulate trades based on strategy
    for (let i = 0; i < historicalData.length; i++) {
      const bar = historicalData[i]
      
      // Check entry conditions
      if (this.checkEntryConditions(strategy, historicalData, i)) {
        const entry = bar.close
        
        // Find exit
        const exitIndex = this.findExit(strategy, historicalData, i)
        if (exitIndex > i) {
          const exit = historicalData[exitIndex].close
          const pl = (exit - entry) / entry * equity * 0.1 // 10% position size
          
          equity += pl
          
          trades.push({
            symbol,
            direction: strategy.direction,
            entryPrice: entry,
            exitPrice: exit,
            entryDate: bar.date,
            exitDate: historicalData[exitIndex].date,
            profitLoss: pl
          })
        }
      }
      
      equityCurve.push({ date: bar.date, equity })
    }

    const metrics = await analyticsService.calculateMetrics(trades)

    return { trades, metrics, equityCurve }
  }
}
```

---

## 🔐 Güvenlik

### Önemli Güvenlik Önlemleri

1. **Environment Variables**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=random_secure_string
```

2. **Row Level Security (RLS)**
```sql
-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own trades
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);
```

3. **API Rate Limiting**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}
```

---

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/trade-journal.git
git push -u origin main
```

2. **Vercel'e Deploy**
- [vercel.com](https://vercel.com) ziyaret edin
- GitHub repository bağlayın
- Environment variables ekleyin
- Deploy!

### Database Migration
```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Initialize
supabase init

# Create migration
supabase migration new initial_schema

# Apply migrations
supabase db push
```

---

## 📚 Kaynak Öğrenme Listesi

### Öncelikli Öğrenme
1. **Next.js 14 App Router** (1 hafta)
2. **TypeScript Basics** (1 hafta)
3. **TailwindCSS** (3 gün)
4. **Supabase Auth & Database** (1 hafta)
5. **React Hooks & State Management** (1 hafta)

### İleri Seviye
1. **PostgreSQL & SQL** (2 hafta)
2. **API Development** (1 hafta)
3. **Trading Concepts** (Sürekli)
4. **Data Visualization (Charts)** (1 hafta)
5. **Performance Optimization** (1 hafta)

### Önerilen Kaynaklar
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 💡 İpuçları

1. **Küçük başlayın**: Önce basit bir trade logger yapın
2. **İteratif geliştirin**: Her özelliği adım adım ekleyin
3. **Test edin**: Her özelliği test edin
4. **Dokümante edin**: Kodunuzu açıklayın
5. **Geri bildirim alın**: Kullanıcılardan feedback isteyin

---

## 🎯 Başarı Metrikleri

- ✅ Kullanıcı kaydı/girişi çalışıyor
- ✅ Trade ekleyebiliyorsunuz
- ✅ Grafikler görüntüleniyor
- ✅ Broker entegrasyonu çalışıyor
- ✅ Analytics doğru hesaplanıyor
- ✅ Responsive tasarım
- ✅ Hızlı yükleme süreleri

---

**Başarılar! 🚀**

