'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface ItemFormData {
  name: string
  description: string
  item_type: string
  rarity: string
  max_stack: number
  buy_price: number
  sell_price: number
  level_requirement: number
  job_requirement: string[]
  effects: any[]
  sale_type: string
  icon_path: string
  active: boolean
}

export default function NewItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    item_type: 'weapon',
    rarity: 'common',
    max_stack: 1,
    buy_price: 0,
    sell_price: 0,
    level_requirement: 1,
    job_requirement: [],
    effects: [],
    sale_type: 'shop',
    icon_path: '',
    active: true
  })

  const [jobRequirementInput, setJobRequirementInput] = useState('')
  const [effectInput, setEffectInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiClient.post('/admin/items', {
        item: formData
      })
      router.push('/items')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アイテムの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addJobRequirement = () => {
    if (jobRequirementInput.trim() && !formData.job_requirement.includes(jobRequirementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        job_requirement: [...prev.job_requirement, jobRequirementInput.trim()]
      }))
      setJobRequirementInput('')
    }
  }

  const removeJobRequirement = (job: string) => {
    setFormData(prev => ({
      ...prev,
      job_requirement: prev.job_requirement.filter(j => j !== job)
    }))
  }

  const addEffect = () => {
    try {
      const effect = JSON.parse(effectInput.trim())
      setFormData(prev => ({
        ...prev,
        effects: [...prev.effects, effect]
      }))
      setEffectInput('')
    } catch (error) {
      alert('効果のJSONが正しくありません')
    }
  }

  const removeEffect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      effects: prev.effects.filter((_, i) => i !== index)
    }))
  }

  const addPresetEffect = (type: string) => {
    let effect: any = {}
    switch (type) {
      case 'stat_boost':
        effect = { type: 'stat_boost', stat: 'attack', value: 10 }
        break
      case 'heal':
        effect = { type: 'heal', value: 50 }
        break
      case 'mp_heal':
        effect = { type: 'mp_heal', value: 30 }
        break
      case 'exp_boost':
        effect = { type: 'exp_boost', multiplier: 1.5, duration: 1800 }
        break
    }
    
    setFormData(prev => ({
      ...prev,
      effects: [...prev.effects, effect]
    }))
  }

  return (
    <AuthGuard>
      <AdminLayout title="新しいアイテム作成" showBackButton backHref="/items">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700">エラー: {error}</div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アイテム名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="アイテム名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アイコンパス
                </label>
                <input
                  type="text"
                  value={formData.icon_path}
                  onChange={(e) => handleInputChange('icon_path', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="icons/item_name.png"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="アイテムの説明を入力"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アイテムタイプ *
                </label>
                <select
                  required
                  value={formData.item_type}
                  onChange={(e) => handleInputChange('item_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="weapon">武器</option>
                  <option value="armor">防具</option>
                  <option value="accessory">アクセサリー</option>
                  <option value="consumable">消耗品</option>
                  <option value="material">素材</option>
                  <option value="quest">クエストアイテム</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  レアリティ *
                </label>
                <select
                  required
                  value={formData.rarity}
                  onChange={(e) => handleInputChange('rarity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="common">コモン</option>
                  <option value="uncommon">アンコモン</option>
                  <option value="rare">レア</option>
                  <option value="epic">エピック</option>
                  <option value="legendary">レジェンダリー</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  売却タイプ *
                </label>
                <select
                  required
                  value={formData.sale_type}
                  onChange={(e) => handleInputChange('sale_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="shop">ショップ</option>
                  <option value="bazaar">バザー</option>
                  <option value="both">ショップ・バザー</option>
                  <option value="unsellable">売却不可</option>
                </select>
              </div>
            </div>
          </div>

          {/* 数値設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">数値設定</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  必要レベル *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.level_requirement}
                  onChange={(e) => handleInputChange('level_requirement', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大スタック *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_stack}
                  onChange={(e) => handleInputChange('max_stack', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  購入価格
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.buy_price}
                  onChange={(e) => handleInputChange('buy_price', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  売却価格
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.sell_price}
                  onChange={(e) => handleInputChange('sell_price', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 必要職業 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">必要職業</h2>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={jobRequirementInput}
                onChange={(e) => setJobRequirementInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="職業名を入力"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJobRequirement())}
              />
              <button
                type="button"
                onClick={addJobRequirement}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                追加
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.job_requirement.map((job, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md"
                >
                  {job}
                  <button
                    type="button"
                    onClick={() => removeJobRequirement(job)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 効果設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">効果設定</h2>
            
            {/* プリセット効果 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プリセット効果
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addPresetEffect('stat_boost')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                >
                  ステータス強化
                </button>
                <button
                  type="button"
                  onClick={() => addPresetEffect('heal')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                >
                  HP回復
                </button>
                <button
                  type="button"
                  onClick={() => addPresetEffect('mp_heal')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  MP回復
                </button>
                <button
                  type="button"
                  onClick={() => addPresetEffect('exp_boost')}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200"
                >
                  経験値ブースト
                </button>
              </div>
            </div>

            {/* JSON効果入力 */}
            <div className="flex space-x-2 mb-4">
              <textarea
                value={effectInput}
                onChange={(e) => setEffectInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder='{"type": "stat_boost", "stat": "attack", "value": 10}'
                rows={2}
              />
              <button
                type="button"
                onClick={addEffect}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                効果追加
              </button>
            </div>

            {/* 効果一覧 */}
            <div className="space-y-2">
              {formData.effects.map((effect, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <code className="text-sm">{JSON.stringify(effect)}</code>
                  <button
                    type="button"
                    onClick={() => removeEffect(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ステータス */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                アクティブ
              </label>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/items')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '作成中...' : 'アイテム作成'}
            </button>
          </div>
        </form>
      </AdminLayout>
    </AuthGuard>
  )
}