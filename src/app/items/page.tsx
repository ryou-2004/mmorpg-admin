'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface Item {
  id: number
  name: string
  description: string
  item_type: string
  rarity: string
  max_stack: number
  buy_price: number
  sell_price: number
  level_requirement: number
  job_requirement: string[]
  effects: any[]
  sale_type: string
  icon_path: string
  active: boolean
  players_count: number
  created_at: string
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    item_type: '',
    rarity: '',
    active: ''
  })

  useEffect(() => {
    fetchItems()
  }, [filters])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.item_type) params.append('item_type', filters.item_type)
      if (filters.rarity) params.append('rarity', filters.rarity)
      if (filters.active) params.append('active', filters.active)
      params.append('test', 'true') // 開発環境用

      const response = await apiClient.get<{ data: Item[] }>(`/admin/items?${params}`)
      setItems(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アイテムの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600'
      case 'uncommon': return 'text-green-600'
      case 'rare': return 'text-blue-600'
      case 'epic': return 'text-purple-600'
      case 'legendary': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'uncommon': return 'bg-green-100 text-green-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'epic': return 'bg-purple-100 text-purple-800'
      case 'legendary': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getItemTypeDisplay = (itemType: string) => {
    switch (itemType) {
      case 'weapon': return '武器'
      case 'armor': return '防具'
      case 'accessory': return 'アクセサリー'
      case 'consumable': return '消耗品'
      case 'material': return '素材'
      case 'quest': return 'クエストアイテム'
      default: return itemType
    }
  }

  const getRarityDisplay = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'コモン'
      case 'uncommon': return 'アンコモン'
      case 'rare': return 'レア'
      case 'epic': return 'エピック'
      case 'legendary': return 'レジェンダリー'
      default: return rarity
    }
  }

  const getSaleTypeDisplay = (saleType: string) => {
    switch (saleType) {
      case 'shop': return 'ショップ'
      case 'bazaar': return 'バザー'
      case 'both': return 'ショップ・バザー'
      case 'unsellable': return '売却不可'
      default: return saleType
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="アイテム管理">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <AdminLayout title="アイテム管理">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
            <button
              onClick={fetchItems}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              再試行
            </button>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="アイテム管理">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* フィルター */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アイテムタイプ
                </label>
                <select
                  value={filters.item_type}
                  onChange={(e) => setFilters({...filters, item_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全て</option>
                  <option value="weapon">武器</option>
                  <option value="armor">防具</option>
                  <option value="accessory">アクセサリー</option>
                  <option value="consumable">消耗品</option>
                  <option value="material">素材</option>
                  <option value="quest">クエストアイテム</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  レアリティ
                </label>
                <select
                  value={filters.rarity}
                  onChange={(e) => setFilters({...filters, rarity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全て</option>
                  <option value="common">コモン</option>
                  <option value="uncommon">アンコモン</option>
                  <option value="rare">レア</option>
                  <option value="epic">エピック</option>
                  <option value="legendary">レジェンダリー</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={filters.active}
                  onChange={(e) => setFilters({...filters, active: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全て</option>
                  <option value="true">アクティブ</option>
                  <option value="false">非アクティブ</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchItems}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                  更新
                </button>
              </div>
            </div>

            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                アイテム一覧 ({items.length}種類)
              </h3>
              <Link
                href="/items/new"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
              >
                新しいアイテム作成
              </Link>
            </div>
            
            {/* アイテム一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="block">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-lg font-medium ${getRarityColor(item.rarity)}`}>
                      {item.name}
                    </h4>
                    <div className="flex space-x-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadge(item.rarity)}`}>
                        {getRarityDisplay(item.rarity)}
                      </span>
                      {!item.active && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          無効
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">タイプ:</span>
                      <span className="font-medium">{getItemTypeDisplay(item.item_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">必要レベル:</span>
                      <span className="font-medium">Lv.{item.level_requirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">購入価格:</span>
                      <span className="font-medium text-green-600">{item.buy_price.toLocaleString()}G</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">売却価格:</span>
                      <span className="font-medium text-blue-600">{item.sell_price.toLocaleString()}G</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">売却可能:</span>
                      <span className="font-medium">{getSaleTypeDisplay(item.sale_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">所持プレイヤー:</span>
                      <span className="font-medium text-purple-600">{item.players_count}人</span>
                    </div>
                    {item.max_stack > 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">最大スタック:</span>
                        <span className="font-medium">{item.max_stack}個</span>
                      </div>
                    )}
                  </div>
                  
                  {item.job_requirement.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">必要職業:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.job_requirement.map((job, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {job}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {item.effects.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">効果:</div>
                      <div className="text-xs text-gray-700">
                        {item.effects.map((effect, index) => (
                          <div key={index}>
                            {effect.type}: {JSON.stringify(effect).slice(0, 50)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                    <div className="mt-3 text-xs text-gray-400">
                      作成日: {new Date(item.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}