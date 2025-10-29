'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full mb-8">
            <span className="text-2xl">🚀</span>
            <span className="font-semibold">Backtesting 2.0 Artık Yayında!</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Trading hakkında bilmek istediğiniz
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              her şey
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
            Spreadsheet'lerinizin size hiç söylemediği metrikler ve kâra götüren davranışlar. 
            Günlük tutma ve analiz gücüyle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2">
              Hemen Başla
              <ArrowRight size={20} />
            </button>
            <button className="border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-full font-bold text-lg hover:border-blue-600 transition-all">
              Demo İzle
            </button>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
            </div>
            <span className="font-semibold">4.8</span>
            <span>|</span>
            <span>600+ Değerlendirme</span>
          </div>

          {/* Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-xl">Trading Dashboard Önizlemesi</p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 hidden lg:block"
            >
              <div className="text-green-500 font-bold text-2xl">+$12,450</div>
              <div className="text-sm text-slate-500">Bu Ay</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 hidden lg:block"
            >
              <div className="text-blue-500 font-bold text-2xl">73%</div>
              <div className="text-sm text-slate-500">Win Rate</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

