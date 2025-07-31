'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { apiClient } from '@/lib/api'

interface JobClass {
  id: number
  name: string
  job_type: string
  max_level: number
}

interface ComparisonJob {
  id: number
  name: string
  job_type: string
  stats: {
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
}

interface CompareResponse {
  level: number
  comparison: ComparisonJob[]
}

export default function ComparePage() {
  const [jobClasses, setJobClasses] = useState<JobClass[]>([])
  const [comparison, setComparison] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobs, setSelectedJobs] = useState<number[]>([])
  const [selectedLevel, setSelectedLevel] = useState(20)

  // 職業一覧を取得
  useEffect(() => {
    const loadJobClasses = async () => {
      try {
        const data = await apiClient.get<{ job_classes: JobClass[] }>('/admin/job_class_stats')
        setJobClasses(data.job_classes)
      } catch (err) {
        setError(err instanceof Error ? err.message : '職業一覧の取得に失敗しました')
      }
    }
    loadJobClasses()
  }, [])

  const handleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId)
      } else if (prev.length < 6) { // 最大6つまで選択可能
        return [...prev, jobId]
      }
      return prev
    })
  }

  const handleCompare = async () => {
    if (selectedJobs.length === 0) {
      setError('比較する職業を選択してください')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        level: selectedLevel.toString(),
        job_ids: selectedJobs.join(',')
      })
      const data = await apiClient.get<CompareResponse>(`/admin/job_comparisons?${params}`)
      setComparison(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '比較データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedJobs([])
    setComparison(null)
  }

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

  const getStatComparison = (statValue: number, statType: keyof ComparisonJob['stats']) => {
    if (!comparison) return { rank: 0, isMax: false, isMin: false }
    
    const values = comparison.comparison.map(job => job.stats[statType])
    const sortedValues = [...values].sort((a, b) => b - a)
    const rank = sortedValues.indexOf(statValue) + 1
    const isMax = statValue === Math.max(...values)
    const isMin = statValue === Math.min(...values)
    
    return { rank, isMax, isMin }
  }

  const getStatStyle = (statValue: number, statType: keyof ComparisonJob['stats']) => {
    const { isMax, isMin } = getStatComparison(statValue, statType)
    if (isMax && comparison && comparison.comparison.length > 1) {
      return 'bg-green-100 text-green-800 font-semibold'
    } else if (isMin && comparison && comparison.comparison.length > 1) {
      return 'bg-red-100 text-red-800'
    }
    return ''
  }

  return (
    <AdminLayout title="職業比較" showBackButton backHref="/job-stats">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                比較レベル: {selectedLevel}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                比較する職業を選択 ({selectedJobs.length}/6)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {jobClasses.map(job => (
                  <button
                    key={job.id}
                    onClick={() => handleJobSelection(job.id)}
                    disabled={!selectedJobs.includes(job.id) && selectedJobs.length >= 6}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedJobs.includes(job.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : selectedJobs.length >= 6
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{job.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getJobTypeBadgeColor(job.job_type)}`}>
                      {job.job_type}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCompare}
                disabled={selectedJobs.length === 0 || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? '比較中...' : '比較実行'}
              </button>
              <button
                onClick={clearSelection}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                選択クリア
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            エラー: {error}
          </div>
        )}

        {comparison && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                レベル {comparison.level} での職業比較結果
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        職業名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイプ
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
                    {comparison.comparison.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {job.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getJobTypeBadgeColor(job.job_type)}`}>
                            {job.job_type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.max_hp, 'max_hp')}`}>
                          {job.stats.max_hp}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.max_mp, 'max_mp')}`}>
                          {job.stats.max_mp}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.attack, 'attack')}`}>
                          {job.stats.attack}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.defense, 'defense')}`}>
                          {job.stats.defense}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.magic_attack, 'magic_attack')}`}>
                          {job.stats.magic_attack}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.magic_defense, 'magic_defense')}`}>
                          {job.stats.magic_defense}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.agility, 'agility')}`}>
                          {job.stats.agility}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatStyle(job.stats.luck, 'luck')}`}>
                          {job.stats.luck}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h3 className="text-md font-medium mb-4">成長率補正の比較</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          職業名
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
                      {comparison.comparison.map(job => (
                        <tr key={`mult-${job.id}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {job.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.hp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.mp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.attack}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.defense}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.magic_attack}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.magic_defense}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.agility}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ×{job.multipliers.luck}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}