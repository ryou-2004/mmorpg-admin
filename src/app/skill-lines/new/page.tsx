'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthGuard } from '@/components/auth-guard'
import { apiClient } from '@/lib/api'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewSkillLinePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    skill_line_type: 'weapon',
    active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await apiClient.post('/admin/skill_lines', {
        skill_line: form
      })

      router.push(`/skill-lines/${response.data.skill_line.id}`)
    } catch (error) {
      console.error('Failed to create skill line:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 max-w-2xl">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" asChild>
            <Link href="/skill-lines">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新しいスキルライン</h1>
            <p className="text-gray-600 mt-1">新しいスキルラインを作成します</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>スキルライン情報</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">スキルライン名 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="例: 片手剣、魔法使いの心得"
                />
              </div>

              <div>
                <Label htmlFor="description">説明 *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="このスキルラインの特徴や効果を説明してください"
                />
              </div>

              <div>
                <Label htmlFor="skill_line_type">スキルラインタイプ *</Label>
                <Select 
                  value={form.skill_line_type} 
                  onValueChange={(value) => setForm({ ...form, skill_line_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weapon">武器スキル</SelectItem>
                    <SelectItem value="job_specific">職業専用</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  武器スキル: 武器に関連するスキル、職業専用: 特定の職業固有のスキル
                </p>
              </div>

              <div className="flex space-x-4 pt-6 border-t">
                <Button type="submit" disabled={submitting} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? '作成中...' : '作成'}
                </Button>
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/skill-lines">キャンセル</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}