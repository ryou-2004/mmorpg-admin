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

interface Warehouse {
  id: number
  name: string
  max_slots: number
  used_slots: number
}

interface WarehouseData {
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

interface PlayerDetails {
  id: number
  name: string
  warehouses: Warehouse[]
}

export default function PlayerWarehousePage() {
  const params = useParams()
  const playerId = params.id as string
  
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouseData, setWarehouseData] = useState<WarehouseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (playerId) {
      fetchPlayerData()
    }
  }, [playerId])

  useEffect(() => {
    if (selectedWarehouse) {
      fetchWarehouseData(selectedWarehouse.id)
    }
  }, [selectedWarehouse])

  const fetchPlayerData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<PlayerDetails>(`/admin/players/${playerId}`)
      setPlayer(response)
      if (response.warehouses.length > 0) {
        setSelectedWarehouse(response.warehouses[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プレイヤーデータの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouseData = async (warehouseId: number) => {
    try {
      const response = await apiClient.get<WarehouseData>(`/admin/players/${playerId}/player_items?location=warehouse&warehouse_id=${warehouseId}`)
      setWarehouseData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '倉庫データの取得に失敗しました')
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
        <AdminLayout title="倉庫管理" showBackButton backHref={`/players/${playerId}`}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error || !player) {
    return (
      <AuthGuard>
        <AdminLayout title="倉庫管理" showBackButton backHref={`/players/${playerId}`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error || 'データが見つかりません'}</div>
            <button
              onClick={fetchPlayerData}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              再試行
            </button>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (player.warehouses.length === 0) {
    return (
      <AuthGuard>
        <AdminLayout title={`${player.name}の倉庫管理`} showBackButton backHref={`/players/${playerId}`}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="text-yellow-700">このプレイヤーは倉庫を持っていません</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout title={`${player.name}の倉庫管理`} showBackButton backHref={`/players/${playerId}`}>
        <div className="space-y-6">
          {/* ヘッダー情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">倉庫管理</h3>
                <p className="text-sm text-gray-500">
                  プレイヤー: {player.name} | 
                  倉庫数: {player.warehouses.length}個
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
                  href={`/players/${playerId}/equipment`}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  装備へ
                </Link>
              </div>
            </div>
          </div>

          {/* 倉庫選択タブ */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {player.warehouses.map((warehouse) => (
                  <button
                    key={warehouse.id}
                    onClick={() => setSelectedWarehouse(warehouse)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      selectedWarehouse?.id === warehouse.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {warehouse.name}
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {warehouse.used_slots}/{warehouse.max_slots}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 選択された倉庫の内容 */}
            {selectedWarehouse && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedWarehouse.name}</h4>
                    <p className="text-sm text-gray-500">
                      使用スロット: {selectedWarehouse.used_slots}/{selectedWarehouse.max_slots} |
                      {warehouseData ? ` アイテム数: ${warehouseData.meta.total_count}個` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/players/${playerId}/warehouse/${selectedWarehouse.id}`}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    詳細管理
                  </Link>
                </div>

                {/* アイテム一覧（簡易表示） */}
                {!warehouseData ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">読み込み中...</div>
                  </div>
                ) : warehouseData.data.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">この倉庫にアイテムがありません</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {warehouseData.data.slice(0, 9).map((playerItem) => (
                      <div key={playerItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-lg">
                              {getItemTypeIcon(playerItem.item.item_type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {playerItem.item.name}
                              </span>
                              <span className="text-sm">{getRarityIcon(playerItem.item.rarity)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              {playerItem.quantity > 1 && (
                                <span>x{playerItem.quantity}</span>
                              )}
                              {playerItem.locked && <span>🔒</span>}
                              {playerItem.enchantment_level > 0 && (
                                <span>+{playerItem.enchantment_level}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {warehouseData.data.length > 9 && (
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                        <Link
                          href={`/players/${playerId}/warehouse/${selectedWarehouse.id}`}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          他 {warehouseData.data.length - 9} アイテムを表示
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}