'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  FileText, 
  Target, 
  TrendingUp,
  PlayCircle,
  Users,
  BookOpen,
  Activity
} from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Güçlü analiz araçlarıyla trading performansınızı detaylı inceleyin.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileText,
    title: 'Otomatik Günlük',
    description: 'Broker entegrasyonuyla işlemleriniz otomatik olarak kaydedilir.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Target,
    title: 'Playbook',
    description: 'Stratejilerinizi oluşturun, test edin ve performansını takip edin.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: TrendingUp,
    title: 'Raporlama',
    description: '50+ farklı rapor ile güçlü ve zayıf yönlerinizi keşfedin.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: PlayCircle,
    title: 'Backtesting',
    description: 'Stratejilerinizi geçmiş verilerde test edin ve optimize edin.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Activity,
    title: 'Replay',
    description: 'İşlemlerinizi tekrar izleyin ve hatalarınızı analiz edin.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Users,
    title: 'Topluluk',
    description: 'Binlerce trader ile birlikte öğrenin ve gelişin.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: BookOpen,
    title: 'Eğitim',
    description: 'Ücretsiz eğitim içerikleriyle trading becerilerinizi geliştirin.',
    color: 'from-teal-500 to-cyan-500'
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trading'i Bir Üst Seviyeye Taşıyın
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Profesyonel trader'ların kullandığı araçlar artık sizin için
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

