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

interface InventoryData {
  data: CharacterItem[]
  meta: {
    location: string
    total_count: number
    character: {
      id: number
      name: string
    }
  }
}

export default function CharacterInventoryPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [warehouses, setWarehouses] = useState<{id: number, name: string}[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null)

  useEffect(() => {
    if (characterId) {
      fetchInventoryData()
    }
  }, [characterId])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      
      // キャラクター情報から倉庫一覧を取得
      const characterResponse = await apiClient.get(`/admin/characters/${characterId}?test=true`)
      const characterData = characterResponse as any
      setWarehouses(characterData.warehouses || [])
      if (characterData.warehouses && characterData.warehouses.length > 0) {
        setSelectedWarehouse(characterData.warehouses[0].id)
      }
      
      // インベントリデータを取得
      const response = await apiClient.get<InventoryData>(`/admin/characters/${characterId}/character_items?location=inventory&test=true`)
      setInventoryData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'インベントリデータの取得に失敗しました')
    } finally {
      setLoading(false)
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

  const handleMoveToWarehouse = async (characterItemId: number) => {
    if (!selectedWarehouse) {
      alert('移動先の倉庫を選択してください')
      return
    }

    try {
      setActionLoading(characterItemId)
      await apiClient.patch(`/admin/characters/${characterId}/character_items/${characterItemId}/move_to_warehouse?test=true`, {
        warehouse_id: selectedWarehouse
      })
      await fetchInventoryData() // データを再取得
      alert('アイテムを倉庫に移動しました')
    } catch (err) {
      alert(err instanceof Error ? err.message : '倉庫への移動に失敗しました')
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
      await fetchInventoryData() // データを再取得
      
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
        <AdminLayout title="インベントリ" showBackButton backHref={`/characters/${characterId}`}>
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
        <AdminLayout title="インベントリ" showBackButton backHref={`/characters/${characterId}`}>
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
      <AdminLayout title={`${inventoryData.meta.character.name}のインベントリ`} showBackButton backHref={`/characters/${characterId}`}>
        <div className="space-y-6">
          {/* ヘッダー情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">インベントリ管理</h3>
                <p className="text-sm text-gray-500">
                  キャラクター: {inventoryData.meta.character.name} | 
                  アイテム数: {inventoryData.meta.total_count}個
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {warehouses.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">移動先倉庫:</label>
                    <select
                      value={selectedWarehouse || ''}
                      onChange={(e) => setSelectedWarehouse(parseInt(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Link
                    href={`/characters/${characterId}/warehouse`}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    倉庫へ
                  </Link>
                  <Link
                    href={`/characters/${characterId}/equipment`}
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    装備へ
                  </Link>
                </div>
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
                {inventoryData.data.map((characterItem) => (
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
                          {characterItem.equipped && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                              装備中
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
                        {characterItem.can_equip && (
                          <button 
                            onClick={() => handleEquipItem(characterItem.id)}
                            disabled={actionLoading === characterItem.id}
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            装備
                          </button>
                        )}
                        {characterItem.can_move && warehouses.length > 0 && (
                          <button 
                            onClick={() => handleMoveToWarehouse(characterItem.id)}
                            disabled={actionLoading === characterItem.id || !selectedWarehouse}
                            className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
                          >
                            {actionLoading === characterItem.id ? '処理中...' : '倉庫へ'}
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