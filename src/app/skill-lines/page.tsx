'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AuthGuard } from '@/components/auth-guard'
import { apiClient } from '@/lib/api'
import { Search, Plus, Settings } from 'lucide-react'

interface SkillLine {
  id: number
  name: string
  description: string
  skill_line_type: string
  skill_line_type_name: string
  nodes_count: number
  job_classes_count: number
  active: boolean
  created_at: string
  updated_at: string
}

export default function SkillLinesPage() {
  const [skillLines, setSkillLines] = useState<SkillLine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchSkillLines()
  }, [search, typeFilter])

  const fetchSkillLines = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (typeFilter !== 'all') params.append('skill_line_type', typeFilter)
      
      const response = await apiClient.get(`/admin/skill_lines?${params.toString()}`)
      setSkillLines(response.data.skill_lines)
    } catch (error) {
      console.error('Failed to fetch skill lines:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto py-6">
          <div className="text-center">読み込み中...</div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">スキルライン管理</h1>
            <p className="text-gray-600 mt-2">スキルラインとスキルノードを管理します</p>
          </div>
          <Button asChild>
            <Link href="/skill-lines/new">
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Link>
          </Button>
        </div>

        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="スキルライン名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="タイプで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="weapon">武器スキル</SelectItem>
                <SelectItem value="job_specific">職業専用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillLines.map((skillLine) => (
            <Card key={skillLine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{skillLine.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {skillLine.description}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(skillLine.skill_line_type)}>
                    {skillLine.skill_line_type_name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">スキルノード数:</span>
                    <span className="font-medium">{skillLine.nodes_count}個</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">使用職業数:</span>
                    <span className="font-medium">{skillLine.job_classes_count}職業</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ステータス:</span>
                    <Badge variant={skillLine.active ? 'default' : 'secondary'}>
                      {skillLine.active ? '有効' : '無効'}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/skill-lines/${skillLine.id}`}>
                        <Settings className="w-4 h-4 mr-2" />
                        詳細・編集
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {skillLines.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <Settings className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">スキルラインが見つかりません</p>
                <p className="text-sm mt-1">検索条件を変更するか、新しいスキルラインを作成してください。</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  )
}