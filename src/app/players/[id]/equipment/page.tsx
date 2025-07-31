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

interface EquipmentData {
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

export default function PlayerEquipmentPage() {
  const params = useParams()
  const playerId = params.id as string
  
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (playerId) {
      fetchEquipmentData()
    }
  }, [playerId])

  const fetchEquipmentData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<EquipmentData>(`/admin/players/${playerId}/player_items?location=equipped`)
      setEquipmentData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '装備データの取得に失敗しました')
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

  const getEquipmentSlot = (itemType: string) => {
    switch (itemType) {
      case 'weapon': return '武器'
      case 'armor': return '防具'
      case 'accessory': return 'アクセサリー'
      default: return '装備品'
    }
  }

  const getDurabilityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage <= 25) return 'text-red-600'
    if (percentage <= 50) return 'text-orange-600'
    if (percentage <= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="装備管理" showBackButton backHref={`/players/${playerId}`}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error || !equipmentData) {
    return (
      <AuthGuard>
        <AdminLayout title="装備管理" showBackButton backHref={`/players/${playerId}`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error || 'データが見つかりません'}</div>
            <button
              onClick={fetchEquipmentData}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              再試行
            </button>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  // 装備をタイプ別に分類
  const equipmentByType = equipmentData.data.reduce((acc, item) => {
    const type = item.item.item_type
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {} as Record<string, PlayerItem[]>)

  return (
    <AuthGuard>
      <AdminLayout title={`${equipmentData.meta.player.name}の装備管理`} showBackButton backHref={`/players/${playerId}`}>
        <div className="space-y-6">
          {/* ヘッダー情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">装備管理</h3>
                <p className="text-sm text-gray-500">
                  プレイヤー: {equipmentData.meta.player.name} | 
                  装備数: {equipmentData.meta.total_count}個
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/players/${playerId}/inventory`}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  インベントリへ
                </Link>
                <Link
                  href={`/players/${playerId}/warehouse`}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  倉庫へ
                </Link>
              </div>
            </div>
          </div>

          {/* 装備一覧 */}
          {equipmentData.data.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center text-gray-500">
                装備しているアイテムがありません
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* タイプ別装備表示 */}
              {Object.entries(equipmentByType).map(([type, items]) => (
                <div key={type} className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <span>{getItemTypeIcon(type)}</span>
                      <span>{getEquipmentSlot(type)}</span>
                      <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                        {items.length}個
                      </span>
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {items.map((playerItem) => (
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
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                ✓ 装備中
                              </span>
                              {playerItem.locked && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                  🔒 ロック中
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>レアリティ: {playerItem.item.rarity}</span>
                              {playerItem.item.level_requirement > 0 && (
                                <span>必要レベル: {playerItem.item.level_requirement}</span>
                              )}
                              <span>装備日: {new Date(playerItem.obtained_at).toLocaleDateString('ja-JP')}</span>
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
                              <span className={`font-medium ${getDurabilityColor(playerItem.durability, playerItem.max_durability)}`}>
                                耐久: {playerItem.durability}/{playerItem.max_durability}
                                {playerItem.durability < playerItem.max_durability && ' ⚠️'}
                              </span>
                              {playerItem.enchantment_level > 0 && (
                                <span className="text-purple-600 font-medium">
                                  強化: +{playerItem.enchantment_level} ✨
                                </span>
                              )}
                            </div>

                            {/* アイテム効果 */}
                            {playerItem.item.effects && Object.keys(playerItem.item.effects).length > 0 && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <div className="text-xs text-blue-700 font-medium mb-1">効果:</div>
                                <div className="text-xs text-blue-600">
                                  {JSON.stringify(playerItem.item.effects, null, 2)}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* アクションボタン */}
                          <div className="flex-shrink-0 flex space-x-2">
                            {playerItem.can_move && (
                              <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded text-sm">
                                装備解除
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
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}