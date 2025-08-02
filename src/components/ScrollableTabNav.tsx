'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export interface TabItem {
  id: string
  label: string
  href: string
  visible: boolean
}

const DEFAULT_TABS: TabItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', href: '/dashboard', visible: true },
  { id: 'users', label: 'ユーザー管理', href: '/users', visible: true },
  { id: 'characters', label: 'キャラクター管理', href: '/characters', visible: true },
  { id: 'equipment-overview', label: '装備状況一覧', href: '/equipment-overview', visible: true },
  { id: 'job-classes', label: '職業管理', href: '/job-classes', visible: true },
  { id: 'job-stats', label: '職業統計', href: '/job-stats', visible: true },
  { id: 'items', label: 'アイテム管理', href: '/items', visible: true },
  { id: 'skills', label: 'スキル管理', href: '/skills', visible: false },
  { id: 'battles', label: '戦闘ログ', href: '/battles', visible: false },
  { id: 'shops', label: 'ショップ管理', href: '/shops', visible: false }
]

interface ScrollableTabNavProps {
  className?: string
}

export default function ScrollableTabNav({ className = '' }: ScrollableTabNavProps) {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTabs = localStorage.getItem('admin-tabs')
      if (savedTabs) {
        try {
          return JSON.parse(savedTabs)
        } catch {
          return DEFAULT_TABS
        }
      }
    }
    return DEFAULT_TABS
  })

  const visibleTabs = tabs.filter(tab => tab.visible)

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const toggleTabVisibility = (tabId: string) => {
    const updatedTabs = tabs.map(tab =>
      tab.id === tabId ? { ...tab, visible: !tab.visible } : tab
    )
    setTabs(updatedTabs)
    localStorage.setItem('admin-tabs', JSON.stringify(updatedTabs))
  }

  const resetTabs = () => {
    setTabs(DEFAULT_TABS)
    localStorage.setItem('admin-tabs', JSON.stringify(DEFAULT_TABS))
  }

  useEffect(() => {
    updateScrollButtons()
    
    const handleResize = () => updateScrollButtons()
    window.addEventListener('resize', handleResize)
    
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', updateScrollButtons)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', updateScrollButtons)
      }
    }
  }, [visibleTabs])

  return (
    <div className={`relative bg-gray-50 border-b-2 border-gray-300 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center">
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="左にスクロール"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
        
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-1 px-4 py-3 min-w-max">
            {visibleTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 shadow-sm
                    ${isActive
                      ? 'bg-white text-blue-700 border border-blue-200 shadow-md scale-105'
                      : 'bg-white/70 text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:scale-105'
                    }
                  `}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
        
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="右にスクロール"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        )}
        
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="タブ設定"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">タブ表示設定</h3>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {tabs.map((tab) => (
                  <label
                    key={tab.id}
                    className="flex items-center px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tab.visible}
                      onChange={() => toggleTabVisibility(tab.id)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tab.label}</span>
                  </label>
                ))}
              </div>
              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={resetTabs}
                  className="w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  デフォルトに戻す
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
      </div>
    </div>
  )
}