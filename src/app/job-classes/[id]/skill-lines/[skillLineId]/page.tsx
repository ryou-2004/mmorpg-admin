'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface SkillNode {
  id: number
  name: string
  description: string
  node_type: string
  node_type_name: string
  points_required: number
  effects: any
  position_x: number
  position_y: number
  active: boolean
}

interface SkillLineDetail {
  id: number
  name: string
  description: string
  skill_line_type: string
  skill_line_type_name: string
  unlock_level: number
  active: boolean
  skill_nodes: SkillNode[]
  character_investments: {
    total_investments: number
    character_count: number
    average_investment: number
    top_investors: Array<{
      character_name: string
      points_invested: number
      unlocked_nodes_count: number
    }>
  }
  created_at: string
  updated_at: string
}

interface JobClassInfo {
  id: number
  name: string
  job_type: string
}

interface SkillLineDetailResponse {
  job_class: JobClassInfo
  skill_line: SkillLineDetail
}

export default function SkillLineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<SkillLineDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const jobClassId = params.id as string
  const skillLineId = params.skillLineId as string

  useEffect(() => {
    fetchSkillLineDetail()
  }, [jobClassId, skillLineId])

  const fetchSkillLineDetail = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<SkillLineDetailResponse>(
        `/admin/job_classes/${jobClassId}/skill_lines/${skillLineId}?test=true`
      )
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スキルライン詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case 'stat_boost': return 'bg-green-100 text-green-800'
      case 'technique': return 'bg-blue-100 text-blue-800'
      case 'passive': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSkillLineTypeBadge = (type: string) => {
    switch (type) {
      case 'weapon': return 'bg-red-100 text-red-800'
      case 'job_specific': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderEffects = (effects: any) => {
    if (!effects || typeof effects !== 'object') return 'エフェクト情報なし'
    
    return Object.entries(effects).map(([key, value]) => (
      <div key={key} className="text-xs text-gray-600">
        {key}: {String(value)}
      </div>
    ))
  }

  const renderSkillTree = (nodes: SkillNode[]) => {
    if (nodes.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          このスキルラインにはスキルノードがありません
        </div>
      )
    }

    // 必要ポイント順でソートして1本道表示
    const sortedNodes = [...nodes].sort((a, b) => a.points_required - b.points_required)

    return (
      <div className="space-y-4">
        {sortedNodes.map((node, index) => (
          <div key={node.id} className="relative">
            {/* 接続線（最初のノード以外） */}
            {index > 0 && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-4 w-0.5 bg-gray-300"></div>
            )}
            
            <div
              className={`border-2 rounded-lg p-4 max-w-2xl mx-auto ${
                node.active ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{node.name}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNodeTypeBadge(node.node_type)}`}>
                  {node.node_type_name}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{node.description}</p>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">必要ポイント:</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    {node.points_required}
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium text-gray-700">効果:</span>
                  <div className="mt-1 ml-2">
                    {renderEffects(node.effects)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout title="スキルライン詳細" showBackButton backHref={`/job-classes/${jobClassId}`}>
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
        <AdminLayout title="スキルライン詳細" showBackButton backHref={`/job-classes/${jobClassId}`}>
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
        <AdminLayout title="スキルライン詳細" showBackButton backHref={`/job-classes/${jobClassId}`}>
          <div className="text-center text-gray-500">スキルラインが見つかりません</div>
        </AdminLayout>
      </AuthGuard>
    )
  }

  const { job_class: jobClass, skill_line: skillLine } = data

  return (
    <AuthGuard>
      <AdminLayout 
        title={`${jobClass.name} - ${skillLine.name}`} 
        showBackButton 
        backHref={`/job-classes/${jobClassId}`}
      >
        <div className="space-y-6">
          {/* スキルライン基本情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{skillLine.name}</h2>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSkillLineTypeBadge(skillLine.skill_line_type)}`}>
                    {skillLine.skill_line_type_name}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    skillLine.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {skillLine.active ? '有効' : '無効'}
                  </span>
                </div>
                <p className="text-gray-600">{skillLine.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">アンロックレベル</label>
                <p className="mt-1 text-lg font-semibold">Lv.{skillLine.unlock_level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">スキルノード数</label>
                <p className="mt-1 text-lg font-semibold">{skillLine.skill_nodes.length}個</p>
              </div>
            </div>
          </div>

          {/* 投資統計 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">投資統計</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{skillLine.character_investments.total_investments}</div>
                <div className="text-xs text-gray-500">総投資ポイント</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{skillLine.character_investments.character_count}</div>
                <div className="text-xs text-gray-500">投資キャラクター数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{skillLine.character_investments.average_investment}</div>
                <div className="text-xs text-gray-500">平均投資ポイント</div>
              </div>
            </div>

            {/* トップ投資者 */}
            {skillLine.character_investments.top_investors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">トップ投資者</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">キャラクター名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投資ポイント</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">習得ノード数</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {skillLine.character_investments.top_investors.map((investor, index) => (
                        <tr key={index} className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                            {index === 0 && <span className="ml-2 text-yellow-500">👑</span>}
                            {index === 1 && <span className="ml-2 text-gray-400">🥈</span>}
                            {index === 2 && <span className="ml-2 text-orange-500">🥉</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {investor.character_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {investor.points_invested}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {investor.unlocked_nodes_count}個
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* スキルツリー */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">スキルツリー</h3>
            {renderSkillTree(skillLine.skill_nodes)}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}