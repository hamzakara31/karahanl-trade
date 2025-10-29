'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Target,
  PlayCircle,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Tag,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'İşlemler', href: '/dashboard/trades' },
  { icon: BarChart3, label: 'Günlük', href: '/dashboard/journal' },
  { icon: Tag, label: 'Etiketler', href: '/dashboard/tags' },
  { icon: Target, label: 'Stratejiler', href: '/dashboard' },
  { icon: PlayCircle, label: 'Backtesting', href: '/dashboard/backtest' },
]

export default function DashboardNav() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-400"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Karahanlı Trade
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Settings size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <User size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Trader
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64
      `}>
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <Icon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Theme Toggle */}
            {mounted && (
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all w-full"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                <span className="font-medium">{theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}</span>
              </button>
            )}
            
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full">
              <LogOut size={20} />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Spacer for main content */}
      <div className="h-16" />
      <div className="lg:ml-64" />
    </>
  )
}

