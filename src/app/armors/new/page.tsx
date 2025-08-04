'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'

export default function ArmorNewPage() {
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
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

  const saleTypes = [
    { value: 'both', label: '両方' },
    { value: 'shop', label: 'ショップのみ' },
    { value: 'bazaar', label: 'バザーのみ' }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setErrors([])

    try {
      const formData = new FormData(e.currentTarget)
      const jobRequirements = formData.get('job_requirement') as string
      
      const armorData = {
        name: formData.get('name'),
        description: formData.get('description'),
        armor_category: formData.get('armor_category'),
        rarity: formData.get('rarity'),
        max_stack: parseInt(formData.get('max_stack') as string) || 1,
        buy_price: parseInt(formData.get('buy_price') as string) || 0,
        sell_price: parseInt(formData.get('sell_price') as string) || 0,
        level_requirement: parseInt(formData.get('level_requirement') as string) || 1,
        job_requirement: jobRequirements ? jobRequirements.split(',').map(job => job.trim()) : [],
        icon_path: formData.get('icon_path') || '',
        sale_type: formData.get('sale_type'),
        active: formData.get('active') === 'on'
      }

      const response = await apiClient.post<{ armor: { id: number } }>('/admin/armors', { armor: armorData })
      router.push(`/armors/${response.armor.id}`)
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors(['防具の作成に失敗しました'])
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="防具新規作成">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">防具新規作成</h1>
            <Link
              href="/armors"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              一覧に戻る
            </Link>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  名前 *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="armor_category" className="block text-sm font-medium text-gray-700">
                  防具カテゴリ *
                </label>
                <select
                  name="armor_category"
                  id="armor_category"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {armorCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rarity" className="block text-sm font-medium text-gray-700">
                  レアリティ *
                </label>
                <select
                  name="rarity"
                  id="rarity"
                  defaultValue="common"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {rarities.map(rarity => (
                    <option key={rarity.value} value={rarity.value}>
                      {rarity.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level_requirement" className="block text-sm font-medium text-gray-700">
                  必要レベル
                </label>
                <input
                  type="number"
                  name="level_requirement"
                  id="level_requirement"
                  defaultValue={1}
                  min="1"
                  max="100"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  説明
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">価格・販売情報</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="buy_price" className="block text-sm font-medium text-gray-700">
                  購入価格
                </label>
                <input
                  type="number"
                  name="buy_price"
                  id="buy_price"
                  defaultValue={0}
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sell_price" className="block text-sm font-medium text-gray-700">
                  売却価格
                </label>
                <input
                  type="number"
                  name="sell_price"
                  id="sell_price"
                  defaultValue={0}
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="max_stack" className="block text-sm font-medium text-gray-700">
                  最大スタック
                </label>
                <input
                  type="number"
                  name="max_stack"
                  id="max_stack"
                  defaultValue={1}
                  min="1"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="sale_type" className="block text-sm font-medium text-gray-700">
                  販売タイプ
                </label>
                <select
                  name="sale_type"
                  id="sale_type"
                  defaultValue="both"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {saleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">その他</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="job_requirement" className="block text-sm font-medium text-gray-700">
                  職業制限 (カンマ区切り)
                </label>
                <input
                  type="text"
                  name="job_requirement"
                  id="job_requirement"
                  placeholder="戦士, パラディン, 僧侶"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="icon_path" className="block text-sm font-medium text-gray-700">
                  アイコンパス
                </label>
                <input
                  type="text"
                  name="icon_path"
                  id="icon_path"
                  placeholder="armors/leather.png"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    defaultChecked={true}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    有効
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href="/armors"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}