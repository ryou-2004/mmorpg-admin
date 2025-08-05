'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthGuard } from '@/components/auth-guard'
import { apiClient } from '@/lib/api'
import SkillTreeEditor from '@/components/SkillTreeEditor'
import { ArrowLeft, Plus, Edit, Trash2, Save, Settings } from 'lucide-react'

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
  created_at: string
  updated_at: string
}

interface JobClass {
  id: number
  name: string
  job_type: string
  job_type_name: string
  unlock_level: number
}

interface SkillLine {
  id: number
  name: string
  description: string
  skill_line_type: string
  skill_line_type_name: string
  active: boolean
  skill_nodes: SkillNode[]
  job_classes: JobClass[]
  created_at: string
  updated_at: string
}

export default function SkillLineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const skillLineId = params.id as string

  const [skillLine, setSkillLine] = useState<SkillLine | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    skill_line_type: '',
    active: true
  })

  useEffect(() => {
    fetchSkillLine()
  }, [skillLineId])

  const fetchSkillLine = async () => {
    try {
      const response = await apiClient.get(`/admin/skill_lines/${skillLineId}`)
      const data = response.data.skill_line
      setSkillLine(data)
      setEditForm({
        name: data.name,
        description: data.description,
        skill_line_type: data.skill_line_type,
        active: data.active
      })
    } catch (error) {
      console.error('Failed to fetch skill line:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await apiClient.patch(`/admin/skill_lines/${skillLineId}`, {
        skill_line: editForm
      })
      setSkillLine(response.data.skill_line)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update skill line:', error)
    }
  }

  const handleNodeClick = (node: SkillNode) => {
    console.log('Node clicked:', node)
  }

  const handleNodeEdit = (node: SkillNode) => {
    router.push(`/skill-lines/${skillLineId}/nodes/${node.id}/edit`)
  }

  const handleNodeDelete = async (node: SkillNode) => {
    if (!confirm(`「${node.name}」を削除してもよろしいですか？`)) {
      return
    }

    try {
      await apiClient.delete(`/admin/skill_lines/${skillLineId}/skill_nodes/${node.id}`)
      await fetchSkillLine() // Refresh data
    } catch (error) {
      console.error('Failed to delete node:', error)
    }
  }

  const handleAddNode = (x: number, y: number) => {
    const params = new URLSearchParams({
      position_x: x.toString(),
      position_y: y.toString()
    })
    router.push(`/skill-lines/${skillLineId}/nodes/new?${params.toString()}`)
  }

  const handleNodeMove = async (nodeId: number, x: number, y: number) => {
    try {
      await apiClient.patch(`/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}`, {
        skill_node: {
          position_x: x,
          position_y: y
        }
      })
      await fetchSkillLine() // Refresh data
    } catch (error) {
      console.error('Failed to move node:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weapon':
        return 'bg-blue-100 text-blue-800'
      case 'job_specific':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'stat_boost':
        return 'bg-green-100 text-green-800'
      case 'technique':
        return 'bg-purple-100 text-purple-800'
      case 'passive':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6">
          <div className="text-center">読み込み中...</div>
        </div>
      </AuthGuard>
    )
  }

  if (!skillLine) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">スキルラインが見つかりません</h1>
            <Button asChild>
              <Link href="/skill-lines">スキルライン一覧に戻る</Link>
            </Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/skill-lines">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{skillLine.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getTypeColor(skillLine.skill_line_type)}>
                  {skillLine.skill_line_type_name}
                </Badge>
                <Badge variant={skillLine.active ? 'default' : 'secondary'}>
                  {skillLine.active ? '有効' : '無効'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  キャンセル
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="tree">スキルツリー</TabsTrigger>
            <TabsTrigger value="nodes">スキルノード</TabsTrigger>
            <TabsTrigger value="jobs">使用職業</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="name">スキルライン名</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">説明</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="skill_line_type">タイプ</Label>
                      <Select
                        value={editForm.skill_line_type}
                        onValueChange={(value) => setEditForm({ ...editForm, skill_line_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weapon">武器スキル</SelectItem>
                          <SelectItem value="job_specific">職業専用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>説明</Label>
                      <p className="text-sm text-gray-600 mt-1">{skillLine.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>スキルノード数</Label>
                        <p className="text-2xl font-bold text-blue-600">{skillLine.skill_nodes.length}個</p>
                      </div>
                      <div>
                        <Label>使用職業数</Label>
                        <p className="text-2xl font-bold text-green-600">{skillLine.job_classes.length}職業</p>
                      </div>
                    </div>
                    <div>
                      <Label>作成日時</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(skillLine.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tree">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">スキルツリービジュアルエディタ</h3>
                <div className="text-sm text-gray-600">
                  スキルノード数: {skillLine.skill_nodes.length}個
                </div>
              </div>

              <SkillTreeEditor
                skillNodes={skillLine.skill_nodes}
                skillLineId={skillLineId}
                onNodeClick={handleNodeClick}
                onNodeEdit={handleNodeEdit}
                onNodeDelete={handleNodeDelete}
                onAddNode={handleAddNode}
                onNodeMove={handleNodeMove}
                editable={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="nodes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">スキルノード ({skillLine.skill_nodes.length}個)</h3>
                <Button asChild>
                  <Link href={`/skill-lines/${skillLineId}/nodes/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    ノード追加
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {skillLine.skill_nodes.map((node) => (
                  <Card key={node.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{node.name}</CardTitle>
                        <Badge className={getNodeTypeColor(node.node_type)}>
                          {node.node_type_name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{node.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">必要SP:</span>
                          <span className="font-medium ml-1">{node.points_required}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">位置:</span>
                          <span className="font-medium ml-1">({node.position_x}, {node.position_y})</span>
                        </div>
                      </div>

                      {node.effects && Object.keys(node.effects).length > 0 && (
                        <div>
                          <Label className="text-xs">効果</Label>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(node.effects, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="pt-2 border-t flex space-x-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <Link href={`/skill-lines/${skillLineId}/nodes/${node.id}/edit`}>
                            <Edit className="w-3 h-3 mr-1" />
                            編集
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {skillLine.skill_nodes.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-gray-500">
                      <Settings className="mx-auto h-8 w-8 mb-3" />
                      <p className="font-medium">スキルノードがありません</p>
                      <p className="text-sm mt-1">新しいスキルノードを追加してください。</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">使用職業 ({skillLine.job_classes.length}職業)</h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {skillLine.job_classes.map((jobClass) => (
                  <Card key={jobClass.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{jobClass.name}</h4>
                          <p className="text-sm text-gray-600">{jobClass.job_type_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">解除レベル</p>
                          <p className="text-lg font-bold text-blue-600">{jobClass.unlock_level}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {skillLine.job_classes.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">このスキルラインを使用する職業がありません</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}