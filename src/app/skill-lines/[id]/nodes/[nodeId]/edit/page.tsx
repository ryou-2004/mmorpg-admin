'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { AuthGuard } from '@/components/auth-guard'
import { apiClient } from '@/lib/api'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'

interface SkillNode {
  id: number
  name: string
  description: string
  node_type: string
  points_required: number
  effects: any
  position_x: number
  position_y: number
  active: boolean
  skill_line_id: number
}

interface SkillLine {
  id: number
  name: string
}

export default function EditSkillNodePage() {
  const params = useParams()
  const router = useRouter()
  const skillLineId = params.id as string
  const nodeId = params.nodeId as string

  const [skillLine, setSkillLine] = useState<SkillLine | null>(null)
  const [skillNode, setSkillNode] = useState<SkillNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    node_type: 'stat_boost',
    points_required: 5,
    position_x: 0,
    position_y: 0,
    effects: '{}',
    active: true
  })

  useEffect(() => {
    fetchData()
  }, [skillLineId, nodeId])

  const fetchData = async () => {
    try {
      const [skillLineResponse, nodeResponse] = await Promise.all([
        apiClient.get(`/admin/skill_lines/${skillLineId}`),
        apiClient.get(`/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}`)
      ])

      const skillLineData = skillLineResponse.data.skill_line
      const nodeData = nodeResponse.data.skill_node

      setSkillLine(skillLineData)
      setSkillNode(nodeData)
      setForm({
        name: nodeData.name,
        description: nodeData.description,
        node_type: nodeData.node_type,
        points_required: nodeData.points_required,
        position_x: nodeData.position_x,
        position_y: nodeData.position_y,
        effects: JSON.stringify(nodeData.effects, null, 2),
        active: nodeData.active
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let effects = {}
      try {
        effects = JSON.parse(form.effects)
      } catch (error) {
        console.error('Invalid JSON in effects field')
        return
      }

      await apiClient.patch(`/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}`, {
        skill_node: {
          ...form,
          effects
        }
      })

      router.push(`/skill-lines/${skillLineId}`)
    } catch (error) {
      console.error('Failed to update skill node:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このスキルノードを削除してもよろしいですか？')) {
      return
    }

    try {
      await apiClient.delete(`/admin/skill_lines/${skillLineId}/skill_nodes/${nodeId}`)
      router.push(`/skill-lines/${skillLineId}`)
    } catch (error) {
      console.error('Failed to delete skill node:', error)
    }
  }

  const nodeTypeOptions = [
    { value: 'stat_boost', label: 'ステータス上昇' },
    { value: 'technique', label: '技・特技' },
    { value: 'passive', label: 'パッシブ効果' }
  ]

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6">
          <div className="text-center">読み込み中...</div>
        </div>
      </AuthGuard>
    )
  }

  if (!skillLine || !skillNode) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">スキルノードが見つかりません</h1>
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
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" asChild>
            <Link href={`/skill-lines/${skillLineId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">スキルノード編集</h1>
            <p className="text-gray-600 mt-1">{skillLine.name} - {skillNode.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>スキルノード情報</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">ノード名 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="例: 攻撃力上昇"
                />
              </div>

              <div>
                <Label htmlFor="description">説明 *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="このスキルノードの効果を説明してください"
                />
              </div>

              <div>
                <Label htmlFor="node_type">ノードタイプ *</Label>
                <Select value={form.node_type} onValueChange={(value) => setForm({ ...form, node_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="points_required">必要スキルポイント *</Label>
                <Input
                  id="points_required"
                  type="number"
                  min="1"
                  max="100"
                  value={form.points_required}
                  onChange={(e) => setForm({ ...form, points_required: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position_x">X座標</Label>
                  <Input
                    id="position_x"
                    type="number"
                    min="0"
                    value={form.position_x}
                    onChange={(e) => setForm({ ...form, position_x: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="position_y">Y座標</Label>
                  <Input
                    id="position_y"
                    type="number"
                    min="0"
                    value={form.position_y}
                    onChange={(e) => setForm({ ...form, position_y: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="effects">効果 (JSON形式) *</Label>
                <Textarea
                  id="effects"
                  value={form.effects}
                  onChange={(e) => setForm({ ...form, effects: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder='{"type": "stat_boost", "stat": "attack", "value": 5}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON形式で効果を定義してください。
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={form.active}
                  onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                />
                <Label htmlFor="active">有効</Label>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <Button type="submit" disabled={submitting} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? '更新中...' : '更新'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/skill-lines/${skillLineId}`}>キャンセル</Link>
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  className="px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}