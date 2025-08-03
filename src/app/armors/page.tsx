'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'

interface Armor {
  id: number
  name: string
  armor_category: string
  armor_category_name: string
  rarity: string
  level_requirement: number
  buy_price: number
  sell_price: number
  is_shield: boolean
  active: boolean
  character_count: number
  created_at: string
  updated_at: string
}

interface ArmorsResponse {
  armors: Armor[]
  meta: {
    current_page: number
    total_pages: number
    total_count: number
  }
}

export default function ArmorsPage() {
  const [armors, setArmors] = useState<Armor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [meta, setMeta] = useState<ArmorsResponse['meta']>({ current_page: 1, total_pages: 1, total_count: 0 })
  const router = useRouter()

  const armorCategories = [
    { value: 'head', label: '頭' },
    { value: 'body', label: '胴' },
    { value: 'waist', label: '腰' },
    { value: 'arm', label: '腕' },
    { value: 'leg', label: '足' },
    { value: 'shield', label: '盾' }
  ]

  const rarities = [
    { value: 'common', label: 'コモン' },
    { value: 'uncommon', label: 'アンコモン' },
    { value: 'rare', label: 'レア' },
    { value: 'epic', label: 'エピック' },
    { value: 'legendary', label: 'レジェンダリー' }
  ]

  const fetchArmors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('armor_category', categoryFilter)
      if (rarityFilter) params.append('rarity', rarityFilter)

      const response = await apiClient.get<ArmorsResponse>(`/admin/armors?${params.toString()}`)
      setArmors(response.armors)
      setMeta(response.meta)
    } catch (error) {
      console.error('防具データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArmors()
  }, [searchTerm, categoryFilter, rarityFilter])

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


  return (
    <AdminLayout title="防具管理">
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">防具管理</h1>
        
        {/* フィルター */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検索</label>
              <input
                type="text"
                placeholder="防具名で検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">防具カテゴリ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">全ての防具カテゴリ</option>
                {armorCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">レアリティ</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
              >
                <option value="">全てのレアリティ</option>
                {rarities.map(rarity => (
                  <option key={rarity.value} value={rarity.value}>
                    {rarity.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            {meta.total_count}件の防具が見つかりました
          </p>
          <Link
            href="/armors/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            新規作成
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">防具名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">レアリティ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">必要レベル</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">価格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所持キャラ数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {armors.map((armor) => (
                <tr 
                  key={armor.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/armors/${armor.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{armor.name}</div>
                        <div className="text-sm text-gray-500">
                          {armor.armor_category_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{armor.armor_category_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getRarityColor(armor.rarity)}`}>
                      {armor.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Lv.{armor.level_requirement}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>購入: {armor.buy_price.toLocaleString()}G</div>
                    <div className="text-gray-500">売却: {armor.sell_price.toLocaleString()}G</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {armor.character_count}人
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      armor.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {armor.active ? '有効' : '無効'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {armors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">該当する防具が見つかりませんでした。</p>
            </div>
          )}
        </div>
      )}
      </div>
    </AdminLayout>
  )
}