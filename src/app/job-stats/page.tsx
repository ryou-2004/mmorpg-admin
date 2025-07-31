'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { apiClient } from '@/lib/api'

interface JobClass {
  id: number
  name: string
  job_type: string
  max_level: number
  base_stats: {
    hp: number
    mp: number
    attack: number
    defense: number
    magic_attack: number
    magic_defense: number
    agility: number
    luck: number
  }
  multipliers: {
    hp: number
    mp: number
    attack: number
    defense: number
    magic_attack: number
    magic_defense: number
    agility: number
    luck: number
  }
  stats_by_level: Array<{
    level: number
    hp: number
    max_hp: number
    mp: number
    max_mp: number
    attack: number
    defense: number
    magic_attack: number
    magic_defense: number
    agility: number
    luck: number
  }>
}

interface JobStatsResponse {
  levels: number[]
  job_classes: JobClass[]
}

export default function JobStatsPage() {
  const [jobStats, setJobStats] = useState<JobStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customLevels, setCustomLevels] = useState('')
  const [selectedJobTypeFilter, setSelectedJobTypeFilter] = useState('all')

  const loadJobStats = async (levels?: string) => {
    try {
      setLoading(true)
      const params = levels ? `?levels=${levels}` : ''
      const data = await apiClient.get<JobStatsResponse>(`/admin/job_class_stats${params}`)
      setJobStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '職業統計の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobStats()
  }, [])

  const handleLevelFilter = () => {
    const levelArray = customLevels
      .split(',')
      .map(l => l.trim())
      .filter(l => l && !isNaN(Number(l)) && Number(l) > 0 && Number(l) <= 100)
      .join(',')
    
    if (levelArray) {
      loadJobStats(levelArray)
    }
  }

  const resetLevels = () => {
    setCustomLevels('')
    loadJobStats()
  }

  const filteredJobClasses = jobStats?.job_classes.filter(job => 
    selectedJobTypeFilter === 'all' || job.job_type === selectedJobTypeFilter
  ) || []

  const jobTypes = jobStats ? [...new Set(jobStats.job_classes.map(job => job.job_type))] : []

  const getJobTypeBadgeColor = (jobType: string) => {
    switch (jobType) {
      case 'warrior': return 'bg-red-100 text-red-800'
      case 'mage': return 'bg-blue-100 text-blue-800'
      case 'archer': return 'bg-green-100 text-green-800'
      case 'thief': return 'bg-purple-100 text-purple-800'
      case 'priest': return 'bg-yellow-100 text-yellow-800'
      case 'knight': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout title="職業統計">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="職業統計">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          エラー: {error}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="職業統計">
      <div className="space-y-6">
        {/* ナビゲーション */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">職業統計メニュー</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2">レベル別統計</h3>
              <p className="text-sm text-gray-600 mb-3">
                指定レベルでの全職業のステータス比較とランキング
              </p>
              <a
                href="/job-stats/level-samples"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                表示する
              </a>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2">職業比較</h3>
              <p className="text-sm text-gray-600 mb-3">
                選択した職業同士のステータス詳細比較
              </p>
              <a
                href="/job-stats/compare"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                比較する
              </a>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-2">成長チャート</h3>
              <p className="text-sm text-gray-600 mb-3">
                個別職業のレベル別成長グラフと分析（開発予定）
              </p>
              <button
                disabled
                className="inline-block px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
              >
                準備中
              </button>
            </div>
          </div>
        </div>
        {/* レベルフィルター */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">レベル設定</h2>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示レベル（カンマ区切り）
              </label>
              <input
                type="text"
                value={customLevels}
                onChange={(e) => setCustomLevels(e.target.value)}
                placeholder="例: 1,10,20,30,40,50"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={handleLevelFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                フィルター適用
              </button>
            </div>
            <div className="pt-6">
              <button
                onClick={resetLevels}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                リセット
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            現在の表示レベル: {jobStats?.levels.join(', ')}
          </div>
        </div>

        {/* 職業タイプフィルター */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">職業タイプフィルター</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedJobTypeFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedJobTypeFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              すべて
            </button>
            {jobTypes.map(jobType => (
              <button
                key={jobType}
                onClick={() => setSelectedJobTypeFilter(jobType)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedJobTypeFilter === jobType 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {jobType}
              </button>
            ))}
          </div>
        </div>

        {/* 職業統計テーブル */}
        {filteredJobClasses.map(jobClass => (
          <div key={jobClass.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">{jobClass.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getJobTypeBadgeColor(jobClass.job_type)}`}>
                    {jobClass.job_type}
                  </span>
                  <span className="text-sm text-gray-500">最大レベル: {jobClass.max_level}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      レベル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      攻撃力
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      防御力
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      魔攻
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      魔防
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      素早さ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      運
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobClass.stats_by_level.map((levelStat) => (
                    <tr key={levelStat.level} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Lv.{levelStat.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.max_hp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.max_mp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.attack}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.defense}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.magic_attack}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.magic_defense}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.agility}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {levelStat.luck}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 基本ステータスと補正値 */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">基本ステータス</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>HP: {jobClass.base_stats.hp}</div>
                    <div>MP: {jobClass.base_stats.mp}</div>
                    <div>攻撃: {jobClass.base_stats.attack}</div>
                    <div>防御: {jobClass.base_stats.defense}</div>
                    <div>魔攻: {jobClass.base_stats.magic_attack}</div>
                    <div>魔防: {jobClass.base_stats.magic_defense}</div>
                    <div>素早さ: {jobClass.base_stats.agility}</div>
                    <div>運: {jobClass.base_stats.luck}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">成長率補正</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>HP: ×{jobClass.multipliers.hp}</div>
                    <div>MP: ×{jobClass.multipliers.mp}</div>
                    <div>攻撃: ×{jobClass.multipliers.attack}</div>
                    <div>防御: ×{jobClass.multipliers.defense}</div>
                    <div>魔攻: ×{jobClass.multipliers.magic_attack}</div>
                    <div>魔防: ×{jobClass.multipliers.magic_defense}</div>
                    <div>素早さ: ×{jobClass.multipliers.agility}</div>
                    <div>運: ×{jobClass.multipliers.luck}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredJobClasses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            該当する職業が見つかりません
          </div>
        )}
      </div>
    </AdminLayout>
  )
}