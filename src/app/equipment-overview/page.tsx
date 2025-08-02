'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface EquippedItem {
  id: number
  name: string
  rarity: string
  enchantment_level: number
  durability?: number
  max_durability?: number
}

interface Character {
  id: number
  name: string
  current_job: {
    id: number
    name: string
    level: number
  } | null
  equipment: { [slot: string]: EquippedItem | null }
  equipped_count: number
  empty_slots: number
}

interface JobClass {
  id: number
  name: string
}

interface EquipmentOverviewData {
  data: Character[]
  meta: {
    total_characters: number
    equipment_slots: { [key: string]: string }
    available_job_classes: JobClass[]
    filters: {
      character_name?: string
      job_class_id?: string
      missing_equipment?: string
    }
  }
}

export default function EquipmentOverviewPage() {
  const [data, setData] = useState<EquipmentOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // フィルター状態
  const [filters, setFilters] = useState({
    character_name: '',
    job_class_id: '',
    missing_equipment: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('test', 'true')
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await apiClient.get<EquipmentOverviewData>(`/admin/characters/equipments?${params}`)
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '装備状況データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const applyFilters = () => {
    fetchData()
  }

  const clearFilters = () => {
    setFilters({
      character_name: '',
      job_class_id: '',
      missing_equipment: ''
    })
    setTimeout(() => fetchData(), 100)
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

  const getEquipmentSlotIcon = (slot: string) => {
    switch (slot) {
      case '右手': return '⚔️'
      case '左手': return '🛡️'
      case '頭': return '🎩'
      case '胴': return '👔'
      case '腰': return '🎀'
      case '腕': return '🧤'
      case '足': return '👢'
      case '指輪': return '💍'
      case '首飾り': return '📿'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="装備状況一覧">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <AdminLayout title="装備状況一覧">
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
      <AdminLayout title="装備状況一覧">
        <div className="space-y-6">
          {/* フィルター */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">フィルター</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">キャラクター名</label>
                <input
                  type="text"
                  value={filters.character_name}
                  onChange={(e) => handleFilterChange('character_name', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="キャラクター名で検索"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">職業</label>
                <select
                  value={filters.job_class_id}
                  onChange={(e) => handleFilterChange('job_class_id', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">すべての職業</option>
                  {data?.meta.available_job_classes.map(jobClass => (
                    <option key={jobClass.id} value={jobClass.id.toString()}>
                      {jobClass.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">装備なしスロット</label>
                <select
                  value={filters.missing_equipment}
                  onChange={(e) => handleFilterChange('missing_equipment', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">すべて</option>
                  {Object.entries(data.meta.equipment_slots).map(([slot, name]) => (
                    <option key={slot} value={slot}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={applyFilters}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                フィルター適用
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                クリア
              </button>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">統計情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{data.meta.total_characters}</div>
                <div className="text-sm text-gray-600">対象キャラクター数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {data.data.reduce((sum, char) => sum + char.equipped_count, 0)}
                </div>
                <div className="text-sm text-gray-600">装備中アイテム総数</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">
                  {data.data.reduce((sum, char) => sum + char.empty_slots, 0)}
                </div>
                <div className="text-sm text-gray-600">空きスロット総数</div>
              </div>
            </div>
          </div>

          {/* 装備状況一覧 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">装備状況一覧</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      キャラクター
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      職業・レベル
                    </th>
                    {Object.entries(data.meta.equipment_slots).map(([slot, name]) => (
                      <th key={slot} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getEquipmentSlotIcon(slot)}<br/>{name}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      装備率
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((character) => (
                    <tr key={character.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{character.name}</div>
                        <div className="text-sm text-gray-500">ID: {character.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {character.current_job ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{character.current_job.name}</div>
                            <div className="text-sm text-gray-500">Lv.{character.current_job.level}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">未設定</span>
                        )}
                      </td>
                      {Object.keys(data.meta.equipment_slots).map((slot) => {
                        const equipment = character.equipment[slot]
                        return (
                          <td key={slot} className="px-3 py-4 text-center">
                            {equipment ? (
                              <div className="group relative">
                                <div className={`text-xs font-medium ${getRarityColor(equipment.rarity)}`}>
                                  {equipment.name}
                                  {equipment.enchantment_level > 0 && ` +${equipment.enchantment_level}`}
                                </div>
                                {equipment.durability !== undefined && equipment.max_durability && (
                                  <div className="text-xs text-gray-500">
                                    {equipment.durability}/{equipment.max_durability}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {((character.equipped_count / Object.keys(data.meta.equipment_slots).length) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {character.equipped_count}/{Object.keys(data.meta.equipment_slots).length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/characters/${character.id}/equipment`}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          装備管理
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data.data.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                フィルター条件に該当するキャラクターがいません
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}