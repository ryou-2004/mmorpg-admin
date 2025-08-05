'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, ArrowLeft } from 'lucide-react'

interface SkillNode {
  id: number
  name: string
  description: string
  node_type: string
  node_type_name: string
  points_required: number
  effects: any
  display_order: number
  active: boolean
  skill_line_id: number
  created_at: string
  updated_at: string
}

interface SkillLine {
  id: number
  name: string
  skill_line_type: string
}

interface JobClass {
  id: number
  name: string
}

interface SkillNodeDetailResponse {
  skill_node: SkillNode
  skill_line: SkillLine
  job_class: JobClass
}

export default function SkillNodeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<SkillNodeDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const jobClassId = params.id as string
  const skillLineId = params.skillLineId as string
  const nodeId = params.nodeId as string

  useEffect(() => {
    fetchSkillNodeDetail()
  }, [nodeId])

  const fetchSkillNodeDetail = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<SkillNodeDetailResponse>(
        `/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}?test=true`
      )
      setData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スキルノード詳細の取得に失敗しました')
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

  const renderEffects = (effects: any) => {
    if (!effects || typeof effects !== 'object') return 'エフェクト情報なし'
    
    return Object.entries(effects).map(([key, value]) => (
      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="font-medium text-gray-700">{key}:</span>
        <span className="text-gray-900">{String(value)}</span>
      </div>
    ))
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">読み込み中...</div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-red-700">エラー: {error}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!data) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-gray-500">スキルノードが見つかりません</div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const { skill_node: skillNode, skill_line: skillLine, job_class: jobClass } = data

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/job-classes/${jobClassId}/skill-lines/${skillLineId}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                戻る
              </Link>
              <div>
                <nav className="text-sm breadcrumb">
                  <Link href="/job-classes" className="text-blue-600 hover:text-blue-800">職業一覧</Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href={`/job-classes/${jobClassId}`} className="text-blue-600 hover:text-blue-800">
                    {jobClass?.name}
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href={`/job-classes/${jobClassId}/skill-lines/${skillLineId}`} className="text-blue-600 hover:text-blue-800">
                    {skillLine?.name}
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-700">{skillNode.name}</span>
                </nav>
              </div>
            </div>
          </div>

          {/* スキルノード詳細 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{skillNode.name}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {skillNode.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getNodeTypeBadge(skillNode.node_type)}>
                    {skillNode.node_type_name}
                  </Badge>
                  <Badge variant={skillNode.active ? "default" : "secondary"}>
                    {skillNode.active ? '有効' : '無効'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">基本情報</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">必要ポイント</span>
                        <span className="font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          {skillNode.points_required}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">表示順序</span>
                        <span className="font-medium">{skillNode.display_order}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ステータス</span>
                        <span className={`font-medium ${skillNode.active ? 'text-green-600' : 'text-gray-500'}`}>
                          {skillNode.active ? '有効' : '無効'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">所属情報</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">職業</span>
                        <span className="font-medium">{jobClass?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">スキルライン</span>
                        <span className="font-medium">{skillLine?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">スキルライン種別</span>
                        <span className="font-medium">{skillLine?.skill_line_type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 効果詳細 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">効果詳細</h3>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    {Object.keys(skillNode.effects || {}).length > 0 ? (
                      <div className="space-y-1">
                        {renderEffects(skillNode.effects)}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        エフェクト情報が設定されていません
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* メタ情報 */}
              <div className="text-xs text-gray-500 pt-4 border-t">
                <div className="flex justify-between">
                  <span>作成日時: {new Date(skillNode.created_at).toLocaleString('ja-JP')}</span>
                  <span>更新日時: {new Date(skillNode.updated_at).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フローティング編集ボタン */}
        <Link
          href={`/job-classes/${jobClassId}/skill-lines/${skillLineId}/nodes/${nodeId}/edit`}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          <Edit className="h-6 w-6" />
        </Link>
      </div>
    </AuthGuard>
  )
}