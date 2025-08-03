'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'

interface Weapon {
  id: number
  name: string
  description: string
  weapon_category: string
  weapon_category_name: string
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
  one_handed: boolean
  two_handed: boolean
  can_use_left_hand: boolean
  attack_type: string
  physical: boolean
  magical: boolean
  ranged: boolean
  active: boolean
  character_count: number
  created_at: string
  updated_at: string
}

interface WeaponResponse {
  weapon: Weapon
}

export default function WeaponDetailPage({ params }: { params: { id: string } }) {
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        const response = await apiClient.get<WeaponResponse>(`/admin/weapons/${params.id}`)
        setWeapon(response.weapon)
      } catch (error) {
        console.error('武器データの取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeapon()
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

  const getAttackTypeColor = (attackType: string) => {
    switch (attackType) {
      case 'slash': return 'bg-red-100 text-red-800'
      case 'thrust': return 'bg-blue-100 text-blue-800'
      case 'blunt': return 'bg-yellow-100 text-yellow-800'
      case 'magical': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout title="武器詳細">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!weapon) {
    return (
      <AdminLayout title="武器詳細">
        <div className="text-center py-12">
          <p className="text-gray-500">武器が見つかりませんでした。</p>
          <Link href="/weapons" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            武器一覧に戻る
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="武器詳細">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{weapon.name}</h1>
            <div className="flex space-x-2">
              <Link
                href={`/weapons/${weapon.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                編集
              </Link>
              <Link
                href="/weapons"
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
                <dd className="mt-1 text-sm text-gray-900">{weapon.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">カテゴリ</dt>
                <dd className="mt-1 text-sm text-gray-900">{weapon.weapon_category_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">レアリティ</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityColor(weapon.rarity)}`}>
                    {weapon.rarity}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">攻撃タイプ</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttackTypeColor(weapon.attack_type)}`}>
                    {weapon.attack_type}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">必要レベル</dt>
                <dd className="mt-1 text-sm text-gray-900">Lv.{weapon.level_requirement}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">装備タイプ</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {weapon.one_handed ? '片手武器' : '両手武器'}
                  {weapon.can_use_left_hand && ' (左手装備可能)'}
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
                <dd className="mt-1 text-sm text-gray-900">{weapon.buy_price.toLocaleString()}G</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">売却価格</dt>
                <dd className="mt-1 text-sm text-gray-900">{weapon.sell_price.toLocaleString()}G</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">販売タイプ</dt>
                <dd className="mt-1 text-sm text-gray-900">{weapon.sale_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">最大スタック</dt>
                <dd className="mt-1 text-sm text-gray-900">{weapon.max_stack}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">所持キャラ数</dt>
                <dd className="mt-1 text-sm text-gray-900">{weapon.character_count}人</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">状態</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    weapon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {weapon.active ? '有効' : '無効'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* 説明 */}
          <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">説明</h2>
            <p className="text-sm text-gray-700">{weapon.description}</p>
          </div>

          {/* 職業制限 */}
          {weapon.job_requirement && weapon.job_requirement.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">職業制限</h2>
              <div className="flex flex-wrap gap-2">
                {weapon.job_requirement.map((job, index) => (
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
          {weapon.effects && weapon.effects.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">効果</h2>
              <div className="space-y-2">
                {weapon.effects.map((effect, index) => (
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
              <dd className="mt-1 text-sm text-gray-900">{weapon.icon_path}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">作成日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(weapon.created_at).toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">更新日時</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(weapon.updated_at).toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900">#{weapon.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </AdminLayout>
  )
}