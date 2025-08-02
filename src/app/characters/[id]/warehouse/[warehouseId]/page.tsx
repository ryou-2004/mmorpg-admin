'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface CharacterItem {
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

interface WarehouseData {
  data: CharacterItem[]
  meta: {
    location: string
    warehouse_id: string
    total_count: number
    character: {
      id: number
      name: string
    }
  }
}

interface Warehouse {
  id: number
  name: string
  max_slots: number
  used_slots: number
}

export default function WarehouseDetailPage() {
  const params = useParams()
  const characterId = params.id as string
  const warehouseId = params.warehouseId as string
  
  const [warehouseData, setWarehouseData] = useState<WarehouseData | null>(null)
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (characterId && warehouseId) {
      fetchData()
    }
  }, [characterId, warehouseId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // プレイヤー情報から倉庫情報を取得
      const playerResponse = await apiClient.get(`/admin/characters/${characterId}?test=true`)
      const playerData = playerResponse as any
      const warehouseInfo = playerData.warehouses.find((w: Warehouse) => w.id === parseInt(warehouseId))
      setWarehouse(warehouseInfo)
      
      // 倉庫のアイテム情報を取得
      const warehouseResponse = await apiClient.get<WarehouseData>(`/admin/characters/${characterId}/character_items?location=warehouse&warehouse_id=${warehouseId}&test=true`)
      setWarehouseData(warehouseResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleMoveToInventory = async (characterItemId: number) => {
    try {
      setActionLoading(characterItemId)
      await apiClient.patch(`/admin/characters/${characterId}/character_items/${characterItemId}/move_to_inventory?test=true`)
      await fetchData() // データを再取得
      alert('アイテムをインベントリに移動しました')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'インベントリへの移動に失敗しました')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEquipItem = async (characterItemId: number) => {
    try {
      setActionLoading(characterItemId)
      // 装備ページにリダイレクト
      window.location.href = `/characters/${characterId}/equipment`
    } catch (err) {
      alert(err instanceof Error ? err.message : '装備に失敗しました')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUseItem = async (characterItemId: number) => {
    if (!confirm('このアイテムを使用しますか？')) {
      return
    }

    try {
      setActionLoading(characterItemId)
      const response = await apiClient.patch(`/admin/characters/${characterId}/character_items/${characterItemId}/use_item?test=true`)
      await fetchData() // データを再取得
      
      const result = response as any
      alert(`${result.message}\n効果: ${result.effects.join(', ')}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'アイテムの使用に失敗しました')
    } finally {
      setActionLoading(null)
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
        <AdminLayout title="倉庫詳細" showBackButton backHref={`/characters/${characterId}/warehouse`}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error || !warehouseData || !warehouse) {
    return (
      <AuthGuard>
        <AdminLayout title="倉庫詳細" showBackButton backHref={`/characters/${characterId}/warehouse`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error || 'データが見つかりません'}</div>
            <button
              onClick={fetchData}
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
      <AdminLayout title={`${warehouse.name} - ${warehouseData.meta.character.name}`} showBackButton backHref={`/characters/${characterId}/warehouse`}>
        <div className="space-y-6">
          {/* ヘッダー情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{warehouse.name}</h3>
                <p className="text-sm text-gray-500">
                  キャラクター: {warehouseData.meta.character.name} | 
                  使用スロット: {warehouse.used_slots}/{warehouse.max_slots} |
                  アイテム数: {warehouseData.meta.total_count}個
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/characters/${characterId}/inventory`}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  インベントリへ
                </Link>
                <Link
                  href={`/characters/${characterId}/equipment`}
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  装備へ
                </Link>
              </div>
            </div>
            
            {/* スロット使用率バー */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>スロット使用率</span>
                <span>{warehouse.used_slots}/{warehouse.max_slots}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    warehouse.used_slots / warehouse.max_slots > 0.9 ? 'bg-red-500' :
                    warehouse.used_slots / warehouse.max_slots > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(warehouse.used_slots / warehouse.max_slots) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* アイテム一覧 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">保管アイテム</h3>
            </div>
            
            {warehouseData.data.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                この倉庫にアイテムがありません
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {warehouseData.data.map((characterItem) => (
                  <div key={characterItem.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {/* アイテムアイコン */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          {getItemTypeIcon(characterItem.item.item_type)}
                        </div>
                      </div>
                      
                      {/* アイテム情報 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-medium text-gray-900">
                            {characterItem.item.name}
                          </span>
                          <span className="text-lg">{getRarityIcon(characterItem.item.rarity)}</span>
                          {characterItem.quantity > 1 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                              x{characterItem.quantity}
                            </span>
                          )}
                          {characterItem.locked && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                              🔒 ロック中
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>タイプ: {characterItem.item.item_type}</span>
                          <span>レアリティ: {characterItem.item.rarity}</span>
                          {characterItem.item.level_requirement > 0 && (
                            <span>必要レベル: {characterItem.item.level_requirement}</span>
                          )}
                          <span>保管日: {new Date(characterItem.obtained_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                        
                        {characterItem.item.description && (
                          <div className="mt-2 text-sm text-gray-600">
                            {characterItem.item.description}
                          </div>
                        )}
                        
                        {/* ステータス情報 */}
                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${characterItem.status_color}`}>
                            {characterItem.display_status}
                          </span>
                          {characterItem.durability < characterItem.max_durability && (
                            <span className="text-orange-600">
                              耐久: {characterItem.durability}/{characterItem.max_durability}
                            </span>
                          )}
                          {characterItem.enchantment_level > 0 && (
                            <span className="text-purple-600">
                              強化: +{characterItem.enchantment_level}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="flex-shrink-0 flex space-x-2">
                        {characterItem.can_move && (
                          <button 
                            onClick={() => handleMoveToInventory(characterItem.id)}
                            disabled={actionLoading === characterItem.id}
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            {actionLoading === characterItem.id ? '処理中...' : 'インベントリへ'}
                          </button>
                        )}
                        {characterItem.can_equip && (
                          <button 
                            onClick={() => handleEquipItem(characterItem.id)}
                            disabled={actionLoading === characterItem.id}
                            className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            装備
                          </button>
                        )}
                        {characterItem.can_use && characterItem.item.item_type === 'consumable' && (
                          <button 
                            onClick={() => handleUseItem(characterItem.id)}
                            disabled={actionLoading === characterItem.id}
                            className="bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            {actionLoading === characterItem.id ? '処理中...' : '使用'}
                          </button>
                        )}
                        <Link
                          href={`/characters/${characterId}/items/${characterItem.id}`}
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