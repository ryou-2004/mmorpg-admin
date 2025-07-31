'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface PlayerItem {
  id: number
  quantity: number
  equipped: boolean
  location: string
  status: string
  locked: boolean
  durability: number
  max_durability: number
  enchantment_level: number
  obtained_at: string
  display_status: string
  status_color: string
  can_move: boolean
  can_equip: boolean
  can_use: boolean
  item: {
    id: number
    name: string
    description: string
    item_type: string
    rarity: string
    rarity_color: string
    icon_path: string
    max_stack: number
    level_requirement: number
    effects: any
  }
  warehouse: {
    id: number
    name: string
  } | null
}

interface InventoryData {
  data: PlayerItem[]
  meta: {
    location: string
    total_count: number
    player: {
      id: number
      name: string
    }
  }
}

export default function PlayerInventoryPage() {
  const params = useParams()
  const playerId = params.id as string
  
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (playerId) {
      fetchInventoryData()
    }
  }, [playerId])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<InventoryData>(`/admin/players/${playerId}/player_items?location=inventory`)
      setInventoryData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インベントリデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪'
      case 'rare': return '🔵'
      case 'epic': return '🟣'
      case 'legendary': return '🟡'
      default: return '⚪'
    }
  }

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'weapon': return '⚔️'
      case 'armor': return '🛡️'
      case 'consumable': return '🧪'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="インベントリ" showBackButton backHref={`/players/${playerId}`}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error || !inventoryData) {
    return (
      <AuthGuard>
        <AdminLayout title="インベントリ" showBackButton backHref={`/players/${playerId}`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error || 'データが見つかりません'}</div>
            <button
              onClick={fetchInventoryData}
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
      <AdminLayout title={`${inventoryData.meta.player.name}のインベントリ`} showBackButton backHref={`/players/${playerId}`}>
        <div className="space-y-6">
          {/* ヘッダー情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">インベントリ管理</h3>
                <p className="text-sm text-gray-500">
                  プレイヤー: {inventoryData.meta.player.name} | 
                  アイテム数: {inventoryData.meta.total_count}個
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/players/${playerId}/warehouse`}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  倉庫へ
                </Link>
                <Link
                  href={`/players/${playerId}/equipment`}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  装備へ
                </Link>
              </div>
            </div>
          </div>

          {/* アイテム一覧 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">アイテム一覧</h3>
            </div>
            
            {inventoryData.data.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                インベントリにアイテムがありません
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {inventoryData.data.map((playerItem) => (
                  <div key={playerItem.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {/* アイテムアイコン */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          {getItemTypeIcon(playerItem.item.item_type)}
                        </div>
                      </div>
                      
                      {/* アイテム情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-medium text-gray-900">
                            {playerItem.item.name}
                          </span>
                          <span className="text-lg">{getRarityIcon(playerItem.item.rarity)}</span>
                          {playerItem.quantity > 1 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                              x{playerItem.quantity}
                            </span>
                          )}
                          {playerItem.equipped && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                              装備中
                            </span>
                          )}
                          {playerItem.locked && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                              🔒 ロック中
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>タイプ: {playerItem.item.item_type}</span>
                          <span>レアリティ: {playerItem.item.rarity}</span>
                          {playerItem.item.level_requirement > 0 && (
                            <span>必要レベル: {playerItem.item.level_requirement}</span>
                          )}
                        </div>
                        
                        {playerItem.item.description && (
                          <div className="mt-2 text-sm text-gray-600">
                            {playerItem.item.description}
                          </div>
                        )}
                        
                        {/* ステータス情報 */}
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${playerItem.status_color}`}>
                            {playerItem.display_status}
                          </span>
                          {playerItem.durability < playerItem.max_durability && (
                            <span className="text-orange-600">
                              耐久: {playerItem.durability}/{playerItem.max_durability}
                            </span>
                          )}
                          {playerItem.enchantment_level > 0 && (
                            <span className="text-purple-600">
                              強化: +{playerItem.enchantment_level}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="flex-shrink-0 flex space-x-2">
                        {playerItem.can_equip && (
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                            装備
                          </button>
                        )}
                        {playerItem.can_move && (
                          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                            倉庫へ
                          </button>
                        )}
                        {playerItem.can_use && playerItem.item.item_type === 'consumable' && (
                          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm">
                            使用
                          </button>
                        )}
                        <Link
                          href={`/players/${playerId}/items/${playerItem.id}`}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                        >
                          詳細
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}