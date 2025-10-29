'use client'

import { useState, useEffect } from 'react'
import { tagService } from '@/services/tagService'
import { Tag } from '@/types'
import { Plus, Tag as TagIcon, Trash2, Edit2, Sparkles } from 'lucide-react'

const categoryLabels = {
  mistake: { label: '❌ Hatalar', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' },
  setup: { label: '📊 Setup\'lar', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' },
  habit: { label: '✅ Alışkanlıklar', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' }
}

const colorOptions = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', 
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
]

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mistake' | 'setup' | 'habit'>('all')

  const [formData, setFormData] = useState({
    name: '',
    category: 'mistake' as 'mistake' | 'setup' | 'habit',
    color: '#3B82F6',
    description: ''
  })

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    setLoading(true)
    const data = await tagService.getTags()
    setTags(data)
    setLoading(false)
  }

  const handleCreateDefaults = async () => {
    if (confirm('Varsayılan etiketleri oluşturmak istiyor musunuz? (15 adet)')) {
      await tagService.createDefaultTags()
      loadTags()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingTag) {
      await tagService.updateTag(editingTag.id!, formData)
    } else {
      await tagService.createTag(formData)
    }
    
    setShowModal(false)
    setEditingTag(null)
    setFormData({ name: '', category: 'mistake', color: '#3B82F6', description: '' })
    loadTags()
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      category: tag.category,
      color: tag.color || '#3B82F6',
      description: tag.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu etiketi silmek istediğinize emin misiniz?')) {
      await tagService.deleteTag(id)
      loadTags()
    }
  }

  const filteredTags = selectedCategory === 'all' 
    ? tags 
    : tags.filter(t => t.category === selectedCategory)

  const tagsByCategory = {
    mistake: tags.filter(t => t.category === 'mistake'),
    setup: tags.filter(t => t.category === 'setup'),
    habit: tags.filter(t => t.category === 'habit')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <TagIcon className="text-blue-600" size={36} />
              Etiket Yönetimi
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Trading hatalarınızı, setup'larınızı ve alışkanlıklarınızı takip edin
            </p>
          </div>
          
          <div className="flex gap-3">
            {tags.length === 0 && (
              <button
                onClick={handleCreateDefaults}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <Sparkles size={20} />
                Varsayılan Etiketler
              </button>
            )}
            <button
              onClick={() => {
                setEditingTag(null)
                setFormData({ name: '', category: 'mistake', color: '#3B82F6', description: '' })
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus size={20} />
              Yeni Etiket
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div
              key={category}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {categoryLabels[category as keyof typeof categoryLabels].label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {categoryTags.length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Tümü ({tags.length})
          </button>
          {Object.entries(categoryLabels).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === key
                  ? value.color
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {value.label} ({tagsByCategory[key as keyof typeof tagsByCategory].length})
            </button>
          ))}
        </div>

        {/* Tags Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Henüz etiket yok
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Etiket oluşturarak trading'inizde daha organize olun
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              İlk Etiketi Oluştur
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {tag.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                        categoryLabels[tag.category].color
                      }`}>
                        {categoryLabels[tag.category].label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id!)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {tag.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {tag.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingTag ? 'Etiket Düzenle' : 'Yeni Etiket'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Etiket Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                  placeholder="Örn: FOMO, Breakout, Risk Management"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="mistake">❌ Hata</option>
                  <option value="setup">📊 Setup</option>
                  <option value="habit">✅ Alışkanlık</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Renk
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
                  placeholder="Bu etiket ne anlama geliyor?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTag(null)
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {editingTag ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

