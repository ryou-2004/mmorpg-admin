'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface Item {
  id: number
  name: string
  description: string
  item_type: string
  rarity: string
  level_requirement: number
  job_requirement: string[]
  effects: any[]
  icon_path?: string
}

interface CharacterItem {
  id: number
  item: Item
  quantity: number
  enchantment_level: number
  durability?: number
  max_durability?: number
  location: string
  equipment_slot?: string
}

interface Character {
  id: number
  name: string
  current_job?: {
    id: number
    name: string
    level: number
  }
}

interface EquipmentData {
  character: Character
  equipment_slots: { [key: string]: string }
  equipped_items: { [key: string]: CharacterItem | null }
  total_stats: { [key: string]: number }
  available_items: CharacterItem[]
}

export default function CharacterEquipmentPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showAvailableItems, setShowAvailableItems] = useState(false)

  useEffect(() => {
    fetchEquipmentData()
  }, [characterId])

  const fetchEquipmentData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<EquipmentData>(`/admin/characters/${characterId}/equipment?test=true`)
      setEquipmentData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '装備データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEquip = async (characterItemId: number, slot: string) => {
    try {
      await apiClient.post(`/admin/characters/${characterId}/equipment/equip?test=true`, {
        character_item_id: characterItemId,
        slot: slot
      })
      await fetchEquipmentData()
      setShowAvailableItems(false)
      setSelectedSlot(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '装備に失敗しました')
    }
  }

  const handleUnequip = async (characterItemId: number) => {
    try {
      await apiClient.post(`/admin/characters/${characterId}/equipment/unequip?test=true`, {
        character_item_id: characterItemId
      })
      await fetchEquipmentData()
    } catch (err) {
      alert(err instanceof Error ? err.message : '装備解除に失敗しました')
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

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'weapon': return '⚔️'
      case 'armor': return '🛡️'
      case 'accessory': return '💍'
      default: return '📦'
    }
  }

  const canEquipToSlot = (item: Item, slot: string) => {
    const slotType = slot.replace(/_\d+$/, '') // accessory_1 -> accessory
    return item.item_type === slotType || (item.item_type === 'accessory' && slotType === 'accessory')
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="装備管理" showBackButton backHref={`/characters/${characterId}`}>
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
        <AdminLayout title="装備管理" showBackButton backHref={`/characters/${characterId}`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error || '装備データが見つかりません'}</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AdminLayout 
        title={`装備管理: ${equipmentData.character.name}`} 
        showBackButton 
        backHref={`/characters/${characterId}`}
      >
        <div className="space-y-6">
          {/* キャラクター情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{equipmentData.character.name}</h2>
                {equipmentData.character.current_job && (
                  <p className="text-sm text-gray-600">
                    {equipmentData.character.current_job.name} Lv.{equipmentData.character.current_job.level}
                  </p>
                )}
              </div>
              <button
                onClick={fetchEquipmentData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                更新
              </button>
            </div>
          </div>

          {/* 装備スロット */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">装備中</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(equipmentData.equipment_slots).map(([slot, slotName]) => {
                const equippedItem = equipmentData.equipped_items[slot]
                
                return (
                  <div key={slot} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-700">{slotName}</h4>
                      {equippedItem && (
                        <button
                          onClick={() => handleUnequip(equippedItem.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          解除
                        </button>
                      )}
                    </div>
                    
                    {equippedItem ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getItemTypeIcon(equippedItem.item.item_type)}</span>
                          <div>
                            <p className={`font-medium ${getRarityColor(equippedItem.item.rarity)}`}>
                              {equippedItem.item.name}
                              {equippedItem.enchantment_level > 0 && ` +${equippedItem.enchantment_level}`}
                            </p>
                            <p className="text-xs text-gray-500">{equippedItem.item.description}</p>
                          </div>
                        </div>
                        
                        {equippedItem.item.effects && equippedItem.item.effects.length > 0 && (
                          <div className="mt-2 text-sm text-gray-600">
                            {equippedItem.item.effects.map((effect: any, idx: number) => (
                              <div key={idx}>
                                {effect.stats && Object.entries(effect.stats).map(([stat, value]) => (
                                  <span key={stat} className="text-green-600">
                                    {stat}: +{value} 
                                  </span>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {equippedItem.durability !== undefined && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">
                              耐久度: {equippedItem.durability}/{equippedItem.max_durability}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full"
                                style={{ 
                                  width: `${(equippedItem.durability! / equippedItem.max_durability!) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <button
                          onClick={() => {
                            setSelectedSlot(slot)
                            setShowAvailableItems(true)
                          }}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          装備を選択
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ステータス */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">合計ステータス</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(equipmentData.total_stats).map(([stat, value]) => (
                <div key={stat} className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-700">{value}</div>
                  <div className="text-xs text-gray-500 uppercase">{stat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 装備可能アイテム一覧 */}
          {showAvailableItems && selectedSlot && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    装備可能アイテム - {equipmentData.equipment_slots[selectedSlot]}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAvailableItems(false)
                      setSelectedSlot(null)
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {equipmentData.available_items
                      .filter(item => canEquipToSlot(item.item, selectedSlot))
                      .map(characterItem => (
                        <div 
                          key={characterItem.id}
                          className="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleEquip(characterItem.id, selectedSlot)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`font-medium ${getRarityColor(characterItem.item.rarity)}`}>
                                {characterItem.item.name}
                                {characterItem.enchantment_level > 0 && ` +${characterItem.enchantment_level}`}
                              </p>
                              <p className="text-sm text-gray-600">{characterItem.item.description}</p>
                              
                              {characterItem.item.level_requirement > 1 && (
                                <p className="text-xs text-red-500">
                                  必要レベル: {characterItem.item.level_requirement}
                                </p>
                              )}
                              
                              {characterItem.item.job_requirement.length > 0 && (
                                <p className="text-xs text-purple-500">
                                  職業制限: {characterItem.item.job_requirement.join(', ')}
                                </p>
                              )}
                              
                              {characterItem.item.effects && characterItem.item.effects.length > 0 && (
                                <div className="mt-1 text-xs text-green-600">
                                  {characterItem.item.effects.map((effect: any, idx: number) => (
                                    <span key={idx}>
                                      {effect.stats && Object.entries(effect.stats).map(([stat, value]) => (
                                        <span key={stat}>{stat}: +{value} </span>
                                      ))}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-2xl">{getItemTypeIcon(characterItem.item.item_type)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}