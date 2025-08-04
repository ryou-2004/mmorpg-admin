'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface SkillLineStats {
  id: number
  name: string
  skill_line_type: string
  total_investments: number
  character_count: number
  average_investment: number
  max_investment: number
}

interface OverallStats {
  total_characters: number
  total_skill_points: number
  used_skill_points: number
  available_skill_points: number
  utilization_rate: number
}

interface JobClassInfo {
  id: number
  name: string
  job_type: string
}

interface SkillStatisticsResponse {
  job_class: JobClassInfo
  overall_stats: OverallStats
  skill_line_stats: SkillLineStats[]
}

export default function SkillStatisticsPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<SkillStatisticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const jobClassId = params.id as string

  useEffect(() => {
    fetchSkillStatistics()
  }, [jobClassId])

  const fetchSkillStatistics = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<SkillStatisticsResponse>(
        `/admin/job_classes/${jobClassId}/skill_statistics?test=true`
      )
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スキル統計の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getSkillLineTypeBadge = (type: string) => {
    switch (type) {
      case 'weapon': return 'bg-red-100 text-red-800'
      case 'job_specific': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSkillLineTypeName = (type: string) => {
    switch (type) {
      case 'weapon': return '武器スキル'
      case 'job_specific': return '職業専用スキル'
      default: return type
    }
  }

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    if (rate >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="スキル統計" showBackButton backHref={`/job-classes/${jobClassId}`}>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <AdminLayout title="スキル統計" showBackButton backHref={`/job-classes/${jobClassId}`}>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">エラー: {error}</div>
          </div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  if (!data) {
    return (
      <AuthGuard>
        <AdminLayout title="スキル統計" showBackButton backHref={`/job-classes/${jobClassId}`}>
          <div className="text-center text-gray-500">統計データが見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  const { job_class: jobClass, overall_stats: overallStats, skill_line_stats: skillLineStats } = data

  return (
    <AuthGuard>
      <AdminLayout 
        title={`${jobClass.name} - スキル統計`} 
        showBackButton 
        backHref={`/job-classes/${jobClassId}`}
      >
        <div className="space-y-6">
          {/* 全体統計 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{jobClass.name} 全体スキル統計</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{overallStats.total_characters}</div>
                <div className="text-sm text-gray-500">対象キャラクター数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{overallStats.total_skill_points.toLocaleString()}</div>
                <div className="text-sm text-gray-500">総スキルポイント</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{overallStats.used_skill_points.toLocaleString()}</div>
                <div className="text-sm text-gray-500">使用済みポイント</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{overallStats.available_skill_points.toLocaleString()}</div>
                <div className="text-sm text-gray-500">未使用ポイント</div>
              </div>
            </div>

            {/* 利用率 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">スキルポイント利用率</span>
                <span className={`text-lg font-bold ${getUtilizationColor(overallStats.utilization_rate)}`}>
                  {formatPercentage(overallStats.utilization_rate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    overallStats.utilization_rate >= 80 ? 'bg-green-500' :
                    overallStats.utilization_rate >= 60 ? 'bg-yellow-500' :
                    overallStats.utilization_rate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(overallStats.utilization_rate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* スキルライン別統計 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">スキルライン別統計</h3>
            
            {skillLineStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スキルライン名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総投資ポイント</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投資キャラクター数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均投資</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最大投資</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">普及率</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {skillLineStats.map((skillLine) => {
                      const popularityRate = overallStats.total_characters > 0 
                        ? (skillLine.character_count / overallStats.total_characters) * 100 
                        : 0
                      
                      return (
                        <tr key={skillLine.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{skillLine.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSkillLineTypeBadge(skillLine.skill_line_type)}`}>
                              {getSkillLineTypeName(skillLine.skill_line_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {skillLine.total_investments.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {skillLine.character_count}人
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {skillLine.average_investment.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {skillLine.max_investment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className={`font-medium ${getUtilizationColor(popularityRate)}`}>
                                {formatPercentage(popularityRate)}
                              </span>
                              <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    popularityRate >= 80 ? 'bg-green-500' :
                                    popularityRate >= 60 ? 'bg-yellow-500' :
                                    popularityRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(popularityRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/job-classes/${jobClassId}/skill-lines/${skillLine.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              詳細
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                このジョブクラスにはスキルラインがありません
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">関連アクション</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/job-classes/${jobClassId}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                職業詳細に戻る
              </Link>
              <Link
                href={`/characters?job_class_id=${jobClassId}`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                該当キャラクター一覧
              </Link>
              <button
                onClick={fetchSkillStatistics}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                統計を更新
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}