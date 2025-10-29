import { supabase } from '@/lib/supabase'
import { Tag, TradeTag } from '@/types'

export const tagService = {
  // Tag oluştur
  async createTag(tag: Omit<Tag, 'id' | 'user_id' | 'created_at'>): Promise<Tag | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı girişi gerekli')

      const { data, error } = await supabase
        .from('tags')
        .insert([
          {
            user_id: user.id,
            ...tag
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Tag oluşturma hatası:', error)
      return null
    }
  },

  // Tüm tag'leri getir
  async getTags(category?: 'mistake' | 'setup' | 'habit'): Promise<Tag[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      let query = supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Tag listesi hatası:', error)
      return []
    }
  },

  // Tag güncelle
  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag | null> {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Tag güncelleme hatası:', error)
      return null
    }
  },

  // Tag sil
  async deleteTag(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Tag silme hatası:', error)
      return false
    }
  },

  // Trade'e tag ekle
  async addTagToTrade(tradeId: string, tagId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trade_tags')
        .insert([{ trade_id: tradeId, tag_id: tagId }])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Trade tag ekleme hatası:', error)
      return false
    }
  },

  // Trade'den tag kaldır
  async removeTagFromTrade(tradeId: string, tagId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trade_tags')
        .delete()
        .eq('trade_id', tradeId)
        .eq('tag_id', tagId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Trade tag kaldırma hatası:', error)
      return false
    }
  },

  // Trade'in tag'lerini getir
  async getTradeTagsWithDetails(tradeId: string): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
        .from('trade_tags')
        .select(`
          tag_id,
          tags (*)
        `)
        .eq('trade_id', tradeId)

      if (error) throw error
      
      // @ts-ignore - Supabase nested select type issue
      return data?.map(item => item.tags).filter(Boolean) || []
    } catch (error) {
      console.error('Trade tags getirme hatası:', error)
      return []
    }
  },

  // Varsayılan tag'leri oluştur
  async createDefaultTags(): Promise<void> {
    const defaultTags = [
      // Mistakes
      { name: 'FOMO', category: 'mistake' as const, color: '#EF4444', description: 'Fear of missing out' },
      { name: 'Revenge Trading', category: 'mistake' as const, color: '#DC2626', description: 'Kayıp sonrası duygusal işlem' },
      { name: 'Overtrading', category: 'mistake' as const, color: '#F97316', description: 'Çok fazla işlem açma' },
      { name: 'No Stop Loss', category: 'mistake' as const, color: '#B91C1C', description: 'Stop loss kullanmama' },
      { name: 'Breaking Rules', category: 'mistake' as const, color: '#991B1B', description: 'Kuralları çiğneme' },
      
      // Setups
      { name: 'Breakout', category: 'setup' as const, color: '#3B82F6', description: 'Direnç kırılımı' },
      { name: 'Pullback', category: 'setup' as const, color: '#2563EB', description: 'Geri çekilme' },
      { name: 'Trend Following', category: 'setup' as const, color: '#1D4ED8', description: 'Trend takibi' },
      { name: 'Reversal', category: 'setup' as const, color: '#1E40AF', description: 'Trend dönüşü' },
      { name: 'Scalp', category: 'setup' as const, color: '#60A5FA', description: 'Kısa süreli işlem' },
      
      // Habits
      { name: 'Followed Plan', category: 'habit' as const, color: '#22C55E', description: 'Plana uydum' },
      { name: 'Risk Management', category: 'habit' as const, color: '#16A34A', description: 'Risk yönetimi uygulandı' },
      { name: 'Patient Entry', category: 'habit' as const, color: '#15803D', description: 'Sabırlı giriş' },
      { name: 'Journaling', category: 'habit' as const, color: '#14532D', description: 'Not tutuldu' },
      { name: 'Pre-market Analysis', category: 'habit' as const, color: '#10B981', description: 'Piyasa öncesi analiz' }
    ]

    for (const tag of defaultTags) {
      await this.createTag(tag)
    }
  }
}

