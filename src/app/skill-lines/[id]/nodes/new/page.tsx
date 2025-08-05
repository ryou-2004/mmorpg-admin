'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthGuard } from '@/components/auth-guard'
import { apiClient } from '@/lib/api'
import { ArrowLeft, Save, Plus } from 'lucide-react'

interface SkillLine {
  id: number
  name: string
  skill_line_type: string
}

export default function NewSkillNodePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const skillLineId = params.id as string

  const [skillLine, setSkillLine] = useState<SkillLine | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    node_type: 'stat_boost',
    points_required: 5,
    position_x: parseInt(searchParams.get('position_x') || '0'),
    position_y: parseInt(searchParams.get('position_y') || '0'),
    effects: '{}',
    active: true
  })

  useEffect(() => {
    fetchSkillLine()
  }, [skillLineId])

  const fetchSkillLine = async () => {
    try {
      const response = await apiClient.get(`/admin/skill_lines/${skillLineId}`)
      setSkillLine(response.data.skill_line)
    } catch (error) {
      console.error('Failed to fetch skill line:', error)
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

      await apiClient.post(`/admin/skill_lines/${skillLineId}/skill_nodes`, {
        skill_node: {
          ...form,
          effects
        }
      })

      router.push(`/skill-lines/${skillLineId}`)
    } catch (error) {
      console.error('Failed to create skill node:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const nodeTypeOptions = [
    { value: 'stat_boost', label: 'ステータス上昇' },
    { value: 'technique', label: '技・特技' },
    { value: 'passive', label: 'パッシブ効果' }
  ]

  const getDefaultEffects = (nodeType: string) => {
    switch (nodeType) {
      case 'stat_boost':
        return JSON.stringify({ type: 'stat_boost', stat: 'attack', value: 5 }, null, 2)
      case 'technique':
        return JSON.stringify({ type: 'technique', name: '新技能', damage_multiplier: 1.2 }, null, 2)
      case 'passive':
        return JSON.stringify({ type: 'passive', effect: 'critical_rate', value: 0.05 }, null, 2)
      default:
        return '{}'
    }
  }

  const handleNodeTypeChange = (newType: string) => {
    setForm({
      ...form,
      node_type: newType,
      effects: getDefaultEffects(newType)
    })
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
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" asChild>
            <Link href={`/skill-lines/${skillLineId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新しいスキルノード</h1>
            <p className="text-gray-600 mt-1">{skillLine.name} に追加</p>
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
                <Select value={form.node_type} onValueChange={handleNodeTypeChange}>
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
                  JSON形式で効果を定義してください。ノードタイプを変更すると自動でテンプレートが設定されます。
                </p>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <Button type="submit" disabled={submitting} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? '作成中...' : '作成'}
                </Button>
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href={`/skill-lines/${skillLineId}`}>キャンセル</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}