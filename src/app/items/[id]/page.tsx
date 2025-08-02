'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface ItemStatistics {
  total_items: number
  characters_with_item: number
  average_per_player: number
  median_per_player: number
  max_per_player: number
  min_per_player: number
}

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
  equipment_slot?: string
  created_at: string
  updated_at: string
  statistics: ItemStatistics
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [params.id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ data: Item }>(`/admin/items/${params.id}?test=true`)
      setItem(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アイテムの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!item) return
    
    const confirmMessage = item.statistics.characters_with_item > 0 
      ? `このアイテムは${item.statistics.characters_with_item}人のキャラクターが所持しています。本当に削除しますか？`
      : 'このアイテムを削除しますか？'
    
    if (!confirm(confirmMessage)) return

    try {
      setDeleting(true)
      await apiClient.delete(`/admin/items/${params.id}?test=true`)
      router.push('/items')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アイテムの削除に失敗しました')
    } finally {
      setDeleting(false)
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
      case 'shop': return 'ショップで売却可能'
      case 'bazaar': return 'バザーで売却可能'
      case 'both': return 'ショップ・バザーで売却可能'
      case 'unsellable': return '売却不可'
      default: return saleType
    }
  }

  const getSaleTypeBadge = (saleType: string) => {
    switch (saleType) {
      case 'shop': return 'bg-blue-100 text-blue-800'
      case 'bazaar': return 'bg-green-100 text-green-800'
      case 'both': return 'bg-indigo-100 text-indigo-800'
      case 'unsellable': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEffectValue = (effect: any) => {
    if (effect.type === 'stat_boost') {
      const prefix = effect.value >= 0 ? '+' : ''
      return `${effect.stat}: ${prefix}${effect.value}`
    } else if (effect.type === 'heal') {
      return `HP回復: +${effect.value}`
    } else if (effect.type === 'mp_heal') {
      return `MP回復: +${effect.value}`
    } else if (effect.type === 'exp_boost') {
      return `経験値: x${effect.multiplier} (${effect.duration}秒)`
    } else if (effect.type === 'mp_regeneration') {
      return `MP自動回復: +${effect.value}/秒`
    } else if (effect.type === 'damage_bonus') {
      return `${effect.target}に対するダメージ: x${effect.multiplier}`
    }
    return JSON.stringify(effect)
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="アイテム詳細" showBackButton backHref="/items">
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
        <AdminLayout title="アイテム詳細" showBackButton backHref="/items">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!item) {
    return (
      <AuthGuard>
        <AdminLayout title="アイテム詳細" showBackButton backHref="/items">
          <div className="text-center text-gray-500">アイテムが見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title="アイテム詳細" showBackButton backHref="/items">
        
        {/* アイテム基本情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className={`text-2xl font-bold ${getRarityColor(item.rarity)}`}>
                  {item.name}
                </h1>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRarityBadge(item.rarity)}`}>
                  {getRarityDisplay(item.rarity)}
                </span>
                {!item.active && (
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    無効
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-4">{item.description}</p>
              <div className="flex items-center space-x-4">
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-medium">
                  {getItemTypeDisplay(item.item_type)}
                </span>
                <span className={`px-3 py-1 rounded-md font-medium ${getSaleTypeBadge(item.sale_type)}`}>
                  {getSaleTypeDisplay(item.sale_type)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">ID: {item.id}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 詳細情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">必要レベル</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">Lv.{item.level_requirement}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">最大スタック</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {item.max_stack === 1 ? 'スタック不可' : `${item.max_stack}個`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">購入価格</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {item.buy_price === 0 ? '購入不可' : `${item.buy_price.toLocaleString()}G`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">売却価格</label>
                  <p className="mt-1 text-lg font-semibold text-blue-600">
                    {item.sell_price === 0 ? '売却不可' : `${item.sell_price.toLocaleString()}G`}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">アイコンパス</label>
                <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {item.icon_path || '未設定'}
                </p>
              </div>
              
              {item.equipment_slot && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">装備スロット</label>
                  <p className="mt-1 text-lg font-semibold text-purple-600">
                    {item.equipment_slot}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">作成日時</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(item.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">更新日時</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(item.updated_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 効果・制限 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">効果・制限</h2>
            
            {/* 必要職業 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">必要職業</label>
              {item.job_requirement.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.job_requirement.map((job, index) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md font-medium">
                      {job}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">職業制限なし</p>
              )}
            </div>

            {/* アイテム効果 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">アイテム効果</label>
              {item.effects.length > 0 ? (
                <div className="space-y-2">
                  {item.effects.map((effect, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          {formatEffectValue(effect)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {effect.type}
                        </span>
                      </div>
                      {/* 詳細な効果情報 */}
                      <div className="mt-2 text-xs text-gray-600">
                        <pre className="whitespace-pre-wrap font-mono">
                          {JSON.stringify(effect, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">効果なし</p>
              )}
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">統計情報</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{item.statistics.characters_with_item}</div>
              <div className="text-xs text-gray-500">所持プレイヤー数</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{item.statistics.total_items}</div>
              <div className="text-xs text-gray-500">存在するアイテム数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{item.statistics.average_per_player}</div>
              <div className="text-xs text-gray-500">平均所持数</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{item.statistics.median_per_player}</div>
              <div className="text-xs text-gray-500">中央値</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{item.statistics.max_per_player}</div>
              <div className="text-xs text-gray-500">最大所持数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{item.statistics.min_per_player}</div>
              <div className="text-xs text-gray-500">最小所持数</div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex justify-center space-x-4">
            <Link
              href={`/items/${item.id}/edit`}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
            >
              {deleting ? '削除中...' : '削除'}
            </button>
          </div>
        </div>

      </AdminLayout>
    </AuthGuard>
  )
}