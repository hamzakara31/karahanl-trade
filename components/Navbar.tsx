'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg z-50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Karahanlı Trade
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition">
              Özellikler
            </a>
            <a href="#pricing" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition">
              Fiyatlandırma
            </a>
            <a href="#brokers" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition">
              Broker'lar
            </a>
            <a href="#blog" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition">
              Blog
            </a>
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}
            
            <a href="/login" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 transition">
              Giriş Yap
            </a>
            <a href="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all hover:scale-105">
              Başla
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Theme Toggle Mobile */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}
            
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-700 dark:text-slate-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <a href="#features" className="block py-2 text-slate-700 dark:text-slate-300">
              Özellikler
            </a>
            <a href="#pricing" className="block py-2 text-slate-700 dark:text-slate-300">
              Fiyatlandırma
            </a>
            <a href="#brokers" className="block py-2 text-slate-700 dark:text-slate-300">
              Broker'lar
            </a>
            <a href="#blog" className="block py-2 text-slate-700 dark:text-slate-300">
              Blog
            </a>
            <a href="/login" className="block w-full text-left py-2 text-slate-700 dark:text-slate-300">
              Giriş Yap
            </a>
            <a href="/register" className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-full">
              Başla
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

