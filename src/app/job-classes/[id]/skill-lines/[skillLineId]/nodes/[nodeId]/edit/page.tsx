'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, X } from 'lucide-react'

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
}

interface SkillNodeFormData {
  name: string
  description: string
  node_type: string
  points_required: number
  display_order: number
  active: boolean
  effects: { [key: string]: string }
}

export default function SkillNodeEditPage() {
  const params = useParams()
  const router = useRouter()
  const [skillNode, setSkillNode] = useState<SkillNode | null>(null)
  const [formData, setFormData] = useState<SkillNodeFormData>({
    name: '',
    description: '',
    node_type: 'stat_boost',
    points_required: 1,
    display_order: 1,
    active: true,
    effects: {}
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const jobClassId = params.id as string
  const skillLineId = params.skillLineId as string
  const nodeId = params.nodeId as string

  useEffect(() => {
    fetchSkillNode()
  }, [nodeId])

  const fetchSkillNode = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ skill_node: SkillNode }>(
        `/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}?test=true`
      )
      const node = response.skill_node
      setSkillNode(node)
      setFormData({
        name: node.name,
        description: node.description,
        node_type: node.node_type,
        points_required: node.points_required,
        display_order: node.display_order,
        active: node.active,
        effects: node.effects || {}
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スキルノードの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)

      await apiClient.patch(
        `/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}?test=true`,
        {
          skill_node: formData
        }
      )

      router.push(`/job-classes/${jobClassId}/skill-lines/${skillLineId}/nodes/${nodeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スキルノードの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleEffectChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [key]: value
      }
    }))
  }

  const removeEffect = (key: string) => {
    setFormData(prev => {
      const newEffects = { ...prev.effects }
      delete newEffects[key]
      return {
        ...prev,
        effects: newEffects
      }
    })
  }

  const addEffect = () => {
    const key = `effect_${Object.keys(formData.effects).length + 1}`
    handleEffectChange(key, '')
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

  if (error && !skillNode) {
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/job-classes/${jobClassId}/skill-lines/${skillLineId}/nodes/${nodeId}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                詳細に戻る
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">スキルノード編集</h1>
                {skillNode && (
                  <p className="text-sm text-gray-600 mt-1">{skillNode.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* 編集フォーム */}
          <Card>
            <CardHeader>
              <CardTitle>スキルノード編集</CardTitle>
              <CardDescription>
                スキルノードの情報を編集できます
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-700">{error}</div>
                  </div>
                )}

                {/* 基本情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">スキル名 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="node_type">ノード種別 *</Label>
                      <Select 
                        value={formData.node_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, node_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stat_boost">ステータス強化</SelectItem>
                          <SelectItem value="technique">特技</SelectItem>
                          <SelectItem value="passive">パッシブ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="points_required">必要ポイント *</Label>
                      <Input
                        id="points_required"
                        type="number"
                        min="1"
                        value={formData.points_required}
                        onChange={(e) => setFormData(prev => ({ ...prev, points_required: parseInt(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="display_order">表示順序 *</Label>
                      <Input
                        id="display_order"
                        type="number"
                        min="1"
                        value={formData.display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="active">ステータス</Label>
                      <Select 
                        value={formData.active.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, active: value === 'true' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">有効</SelectItem>
                          <SelectItem value="false">無効</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 説明文 */}
                <div>
                  <Label htmlFor="description">説明文</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* 効果設定 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>効果設定</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addEffect}>
                      効果を追加
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(formData.effects).map(([key, value]) => (
                      <div key={key} className="flex gap-3 items-center">
                        <Input
                          placeholder="効果名 (例: attack)"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value
                            const newEffects = { ...formData.effects }
                            delete newEffects[key]
                            newEffects[newKey] = value
                            setFormData(prev => ({ ...prev, effects: newEffects }))
                          }}
                          className="flex-1"
                        />
                        <Input
                          placeholder="効果値 (例: 10)"
                          value={value}
                          onChange={(e) => handleEffectChange(key, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEffect(key)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {Object.keys(formData.effects).length === 0 && (
                      <div className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded">
                        効果が設定されていません。「効果を追加」ボタンで効果を追加できます。
                      </div>
                    )}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Link
                    href={`/job-classes/${jobClassId}/skill-lines/${skillLineId}/nodes/${nodeId}`}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    キャンセル
                  </Link>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>保存中...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}