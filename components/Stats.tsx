'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '20.2B+', label: 'Günlüklenen İşlem' },
  { value: '100K+', label: 'Backtest Oturumu' },
  { value: '1M+', label: 'Paylaşılan İşlem' },
  { value: '30K+', label: 'Aktif Trader' },
]

export default function Stats() {
  return (
    <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

