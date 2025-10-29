import { supabase } from '@/lib/supabase'

export const uploadService = {
  // Fotoğraf yükle
  async uploadFile(file: File, folder: 'journals' | 'trades' = 'journals'): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('journal-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('journal-attachments')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Upload hatası:', error)
      return null
    }
  },

  // Çoklu fotoğraf yükle
  async uploadMultipleFiles(files: File[], folder: 'journals' | 'trades' = 'journals'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder))
    const results = await Promise.all(uploadPromises)
    return results.filter(url => url !== null) as string[]
  },

  // Fotoğraf sil
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // URL'den file path'i çıkar
      const filePath = fileUrl.split('/').slice(-2).join('/')
      
      const { error } = await supabase.storage
        .from('journal-attachments')
        .remove([filePath])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Silme hatası:', error)
      return false
    }
  }
}

