'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'

interface Armor {
  id: number
  name: string
  description: string
  armor_category: string
  armor_category_name: string
  rarity: string
  max_stack: number
  buy_price: number
  sell_price: number
  level_requirement: number
  job_requirement: string[]
  effects: Array<{
    type: string
    stat?: string
    value: number
    target?: string
    multiplier?: number
  }>
  icon_path: string
  sale_type: string
  is_shield: boolean
  active: boolean
  character_count: number
  created_at: string
  updated_at: string
}

interface ArmorResponse {
  armor: Armor
}

export default function ArmorDetailPage({ params }: { params: { id: string } }) {
  const [armor, setArmor] = useState<Armor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchArmor = async () => {
      try {
        const response = await apiClient.get<ArmorResponse>(`/admin/armors/${params.id}`)
        setArmor(response.armor)
      } catch (error) {
        console.error('防具データの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArmor()
  }, [params.id])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'uncommon': return 'text-green-600 bg-green-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <AdminLayout title="防具詳細">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!armor) {
    return (
      <AdminLayout title="防具詳細">
        <div className="text-center py-12">
          <p className="text-gray-500">防具が見つかりませんでした。</p>
          <Link href="/armors" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            防具一覧に戻る
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="防具詳細">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{armor.name}</h1>
            <div className="flex space-x-2">
              <Link
                href={`/armors/${armor.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                編集
              </Link>
              <Link
                href="/armors"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                一覧に戻る
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">名前</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">カテゴリ</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.armor_category_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">レアリティ</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityColor(armor.rarity)}`}>
                    {armor.rarity}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">必要レベル</dt>
                <dd className="mt-1 text-sm text-gray-900">Lv.{armor.level_requirement}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">防具タイプ</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {armor.is_shield ? '盾' : '防具'}
                </dd>
              </div>
            </dl>
          </div>

          {/* 価格・販売情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">価格・販売情報</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">購入価格</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.buy_price.toLocaleString()}G</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">売却価格</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.sell_price.toLocaleString()}G</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">販売タイプ</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.sale_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">最大スタック</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.max_stack}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">所持キャラ数</dt>
                <dd className="mt-1 text-sm text-gray-900">{armor.character_count}人</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">状態</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    armor.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {armor.active ? '有効' : '無効'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* 説明 */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">説明</h2>
            <p className="text-sm text-gray-700">{armor.description}</p>
          </div>

          {/* 職業制限 */}
          {armor.job_requirement && armor.job_requirement.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">職業制限</h2>
              <div className="flex flex-wrap gap-2">
                {armor.job_requirement.map((job, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {job}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 効果 */}
          {armor.effects && armor.effects.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">効果</h2>
              <div className="space-y-2">
                {armor.effects.map((effect, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span className="text-sm font-medium text-gray-900">
                      {effect.type}
                      {effect.stat && ` (${effect.stat})`}
                      {effect.target && ` → ${effect.target}`}
                    </span>
                    <span className="text-sm text-gray-600">
                      {effect.multiplier ? `${effect.multiplier}倍` : `+${effect.value}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* システム情報 */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">アイコンパス</dt>
              <dd className="mt-1 text-sm text-gray-900">{armor.icon_path}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">作成日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(armor.created_at).toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">更新日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(armor.updated_at).toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900">#{armor.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </AdminLayout>
  )
}