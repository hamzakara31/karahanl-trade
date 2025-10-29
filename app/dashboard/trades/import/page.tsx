'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ImportTradesPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const trades: any[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const trade: any = {}
      
      headers.forEach((header, index) => {
        trade[header] = values[index]?.trim() || ''
      })
      
      trades.push(trade)
    }

    return trades
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    const errors: string[] = []
    let successCount = 0
    let failedCount = 0

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const text = await file.text()
      const parsedTrades = parseCSV(text)

      for (let i = 0; i < parsedTrades.length; i++) {
        const row = parsedTrades[i]
        
        try {
          // Gerekli alanları kontrol et
          if (!row.symbol || !row.direction || !row.entry_price || !row.exit_price) {
            errors.push(`Satır ${i + 2}: Eksik gerekli alanlar (symbol, direction, entry_price, exit_price)`)
            failedCount++
            continue
          }

          const entryPrice = parseFloat(row.entry_price)
          const exitPrice = parseFloat(row.exit_price)
          const quantity = parseFloat(row.quantity || '1')
          const direction = row.direction.toUpperCase()

          if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(quantity)) {
            errors.push(`Satır ${i + 2}: Geçersiz sayısal değerler`)
            failedCount++
            continue
          }

          // P&L hesapla
          const pnl = direction === 'LONG' 
            ? (exitPrice - entryPrice) * quantity 
            : (entryPrice - exitPrice) * quantity
          
          const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100 * (direction === 'LONG' ? 1 : -1)

          const trade = {
            user_id: user.id,
            symbol: row.symbol,
            direction,
            entry_price: entryPrice,
            exit_price: exitPrice,
            quantity,
            entry_date: row.entry_date || new Date().toISOString(),
            exit_date: row.exit_date || new Date().toISOString(),
            pnl: parseFloat(pnl.toFixed(2)),
            profit_loss: parseFloat(pnl.toFixed(2)),
            profit_loss_percent: parseFloat(pnlPercent.toFixed(2)),
            strategy: row.strategy || '',
            notes: row.notes || 'CSV Import',
            rating: parseInt(row.rating) || null,
            profit_target: parseFloat(row.profit_target) || null,
            stop_loss: parseFloat(row.stop_loss) || null,
          }

          const { error } = await supabase
            .from('trades')
            .insert([trade])

          if (error) throw error

          successCount++
        } catch (error: any) {
          errors.push(`Satır ${i + 2}: ${error.message}`)
          failedCount++
        }
      }

      setResult({ success: successCount, failed: failedCount, errors })
    } catch (error: any) {
      alert(`Import hatası: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `symbol,direction,entry_price,exit_price,quantity,entry_date,exit_date,strategy,notes,rating,profit_target,stop_loss
BTC/USD,LONG,50000,52000,1,2024-01-15T10:00:00,2024-01-15T15:00:00,Breakout,Demo trade,5,53000,49000
ETH/USD,SHORT,3000,2800,2,2024-01-16T09:00:00,2024-01-16T14:00:00,Scalping,Demo trade,4,2700,3100`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trades_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/trades">
            <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4">
              <ArrowLeft size={20} />
              Geri
            </button>
          </Link>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📥 İşlem İçe Aktar
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            CSV dosyasından toplu işlem yükleyin
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
            📋 Nasıl Kullanılır?
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>Aşağıdaki "Şablon İndir" butonuna tıklayarak örnek CSV dosyasını indirin</li>
            <li>CSV dosyasını Excel veya metin editöründe açın</li>
            <li>Kendi işlemlerinizi ekleyin (her satır bir işlem)</li>
            <li>Dosyayı kaydedin ve aşağıya yükleyin</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                CSV Şablonu
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Örnek verilerle hazır şablon
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <FileSpreadsheet size={20} />
              Şablon İndir
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Dosya Yükle
          </h3>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload size={48} className="text-slate-400 mb-4" />
              {file ? (
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">
                    CSV dosyasını sürükleyin veya tıklayın
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yalnızca .csv dosyaları
                  </p>
                </div>
              )}
            </label>
          </div>

          {file && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  İçe Aktarılıyor...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  İçe Aktar
                </>
              )}
            </button>
          )}
        </div>

        {/* Import Results */}
        {result && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              📊 İçe Aktarma Sonuçları
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Başarılı</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {result.success}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                <XCircle className="text-red-600 dark:text-red-400" size={24} />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Başarısız</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {result.failed}
                  </p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                  Hatalar:
                </h4>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700 dark:text-red-300 mb-1">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Link href="/dashboard/trades" className="flex-1">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all">
                  İşlemleri Görüntüle
                </button>
              </Link>
              <button
                onClick={() => {
                  setFile(null)
                  setResult(null)
                }}
                className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-lg font-semibold transition-all"
              >
                Yeni İçe Aktarma
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

