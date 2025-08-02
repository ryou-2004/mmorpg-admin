'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'

interface ExperienceAdjustmentFormProps {
  characterId: number
  characterName: string
  currentLevel: number
  currentExperience: number
  onSuccess: () => void
  className?: string
}

export default function ExperienceAdjustmentForm({
  characterId,
  characterName,
  currentLevel,
  currentExperience,
  onSuccess,
  className = ''
}: ExperienceAdjustmentFormProps) {
  const [expAmount, setExpAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(expAmount)
    
    if (!amount || amount <= 0) {
      setError('1以上の経験値を入力してください')
      return
    }

    if (!reason.trim()) {
      setError('変更理由を入力してください')
      return
    }

    const confirmMessage = `${characterName} に ${amount.toLocaleString()} 経験値を付与しますか？\n\n理由: ${reason}`
    if (!confirm(confirmMessage)) return

    try {
      setLoading(true)
      setError(null)

      await apiClient.patch(`/admin/characters/${characterId}/add_experience?test=true`, {
        experience: amount,
        reason: reason
      })

      setExpAmount('')
      setReason('')
      setShowForm(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '経験値の付与に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setExpAmount('')
    setReason('')
    setError(null)
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium transition-colors text-sm"
        >
          🔧 経験値調整
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-yellow-800">管理者用: 経験値調整</h4>
        <button
          onClick={resetForm}
          className="text-yellow-600 hover:text-yellow-800"
        >
          ✕
        </button>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-4">
        <div className="text-xs text-yellow-700">
          <strong>⚠️ 管理者機能</strong><br />
          この機能はバグ修正・イベント補償等の緊急時のみ使用してください。<br />
          操作はログに記録されます。
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            付与する経験値 *
          </label>
          <input
            type="number"
            min="1"
            value={expAmount}
            onChange={(e) => setExpAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="例: 1000"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            現在の経験値: {currentExperience.toLocaleString()} (Lv.{currentLevel})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            変更理由 *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            placeholder="例: バグ修正による補償、イベント報酬の手動付与"
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 font-medium"
          >
            {loading ? '付与中...' : '経験値を付与'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}