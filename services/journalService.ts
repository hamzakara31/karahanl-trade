import { supabase } from '@/lib/supabase'
import { Journal } from '@/types'

export const journalService = {
  // Journal oluştur
  async createJournal(journal: Journal): Promise<Journal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı girişi gerekli')

      const { data, error } = await supabase
        .from('journals')
        .insert([
          {
            user_id: user.id,
            ...journal
          }
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Journal oluşturma hatası:', error)
      return null
    }
  },

  // Journal güncelle
  async updateJournal(id: string, updates: Partial<Journal>): Promise<Journal | null> {
    try {
      const { data, error } = await supabase
        .from('journals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Journal güncelleme hatası:', error)
      return null
    }
  },

  // Tüm journal'ları getir
  async getJournals(): Promise<Journal[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Journal listesi hatası:', error)
      return []
    }
  },

  // Belirli bir tarihteki journal'ı getir
  async getJournalByDate(date: string): Promise<Journal | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }
      return data
    } catch (error) {
      console.error('Journal getirme hatası:', error)
      return null
    }
  },

  // Journal sil
  async deleteJournal(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Journal silme hatası:', error)
      return false
    }
  }
}

