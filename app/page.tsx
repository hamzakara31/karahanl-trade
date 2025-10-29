'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Target, 
  Users, 
  BookOpen,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Activity
} from 'lucide-react'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Stats from '@/components/Stats'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Trading Yolculuğunuza Bugün Başlayın
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              14 günlük para iade garantisi ile risk almadan deneyin
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
              Ücretsiz Başla
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

