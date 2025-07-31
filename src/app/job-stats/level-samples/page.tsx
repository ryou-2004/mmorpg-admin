'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { apiClient } from '@/lib/api'

interface JobStat {
  id: number
  name: string
  job_type: string
  max_level: number
  level: number
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

interface RankingData {
  name: string
  value: number
}

interface LevelSamplesResponse {
  level: number
  job_stats: JobStat[]
  rankings: {
    hp: RankingData[]
    mp: RankingData[]
    attack: RankingData[]
    defense: RankingData[]
    magic_attack: RankingData[]
    magic_defense: RankingData[]
    agility: RankingData[]
    luck: RankingData[]
  }
}

export default function LevelSamplesPage() {
  const [levelSamples, setLevelSamples] = useState<LevelSamplesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState(20)
  const [sortBy, setSortBy] = useState<keyof JobStat['stats']>('hp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadLevelSamples = async (level: number) => {
    try {
      setLoading(true)
      const data = await apiClient.get<LevelSamplesResponse>(`/admin/job_level_samples?level=${level}`)
      setLevelSamples(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レベル別サンプルの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLevelSamples(selectedLevel)
  }, [selectedLevel])

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(e.target.value)
    if (level >= 1 && level <= 100) {
      setSelectedLevel(level)
    }
  }

  const sortedJobStats = levelSamples?.job_stats.slice().sort((a, b) => {
    const aValue = a.stats[sortBy]
    const bValue = b.stats[sortBy]
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
  }) || []

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

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300'
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getStatRank = (jobName: string, statType: keyof JobStat['stats']) => {
    if (!levelSamples) return null
    const sortedStats = levelSamples.job_stats
      .slice()
      .sort((a, b) => b.stats[statType] - a.stats[statType])
    return sortedStats.findIndex(job => job.name === jobName) + 1
  }

  if (loading) {
    return (
      <AdminLayout title="レベル別統計" showBackButton backHref="/job-stats">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">読み込み中...</div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="レベル別統計" showBackButton backHref="/job-stats">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          エラー: {error}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="レベル別統計" showBackButton backHref="/job-stats">
      <div className="space-y-6">
        {/* レベル選択 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <label className="text-lg font-medium text-gray-900">
              レベル {selectedLevel} での全職業ステータス比較
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={selectedLevel}
              onChange={handleLevelChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="100"
              value={selectedLevel}
              onChange={handleLevelChange}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>

        {/* トップ3ランキング */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">ステータス別トップ3</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levelSamples && Object.entries(levelSamples.rankings).map(([statType, rankings]) => (
              <div key={statType} className="border rounded-lg p-3">
                <h3 className="font-medium text-sm mb-2 text-center">
                  {statType === 'hp' ? 'HP' :
                   statType === 'mp' ? 'MP' :
                   statType === 'attack' ? '攻撃力' :
                   statType === 'defense' ? '防御力' :
                   statType === 'magic_attack' ? '魔法攻撃' :
                   statType === 'magic_defense' ? '魔法防御' :
                   statType === 'agility' ? '素早さ' :
                   statType === 'luck' ? '運' : statType}
                </h3>
                <div className="space-y-1">
                  {rankings.map((job, index) => (
                    <div key={index} className={`text-xs px-2 py-1 rounded border ${getRankBadgeColor(index + 1)}`}>
                      {index + 1}位: {job.name} ({job.value})
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ソート設定 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">ソート基準:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as keyof JobStat['stats'])}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hp">HP</option>
              <option value="mp">MP</option>
              <option value="attack">攻撃力</option>
              <option value="defense">防御力</option>
              <option value="magic_attack">魔法攻撃</option>
              <option value="magic_defense">魔法防御</option>
              <option value="agility">素早さ</option>
              <option value="luck">運</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'desc' ? '降順' : '昇順'}
            </button>
          </div>
        </div>

        {/* 職業統計テーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    順位
                  </th>
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
                {sortedJobStats.map((job, index) => {
                  const rank = index + 1
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getRankBadgeColor(rank)}`}>
                          {rank}位
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getJobTypeBadgeColor(job.job_type)}`}>
                          {job.job_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.max_hp}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'max_hp')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.max_mp}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'max_mp')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.attack}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'attack')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.defense}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'defense')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.magic_attack}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'magic_attack')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.magic_defense}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'magic_defense')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.agility}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'agility')}位)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {job.stats.luck}
                          <span className="text-xs text-gray-500 ml-1">({getStatRank(job.name, 'luck')}位)</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}