'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import AuthGuard from '@/components/AuthGuard'
import AdminLayout from '@/components/AdminLayout'

interface JobClass {
  id: number
  name: string
  job_type: string
  max_level: number
  exp_multiplier: number
  description?: string
  created_at: string
  active: boolean
}

export default function JobClassesPage() {
  const [jobClasses, setJobClasses] = useState<JobClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJobClasses()
  }, [])

  const fetchJobClasses = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/job_classes')
      setJobClasses(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '職業の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">職業管理</h1>
              </div>
              <div className="flex items-center space-x-2">
                <a href="/dashboard" className="text-blue-500 hover:text-blue-700">ダッシュボード</a>
                <a href="/users" className="text-blue-500 hover:text-blue-700">ユーザー管理</a>
                <a href="/players" className="text-blue-500 hover:text-blue-700">プレイヤー管理</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">読み込み中...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">職業管理</h1>
              </div>
              <div className="flex items-center space-x-2">
                <a href="/dashboard" className="text-blue-500 hover:text-blue-700">ダッシュボード</a>
                <a href="/users" className="text-blue-500 hover:text-blue-700">ユーザー管理</a>
                <a href="/players" className="text-blue-500 hover:text-blue-700">プレイヤー管理</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700">エラー: {error}</div>
              <button
                onClick={fetchJobClasses}
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                再試行
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'basic':
        return 'bg-green-100 text-green-800'
      case 'advanced':
        return 'bg-blue-100 text-blue-800'
      case 'special':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeName = (jobType: string) => {
    switch (jobType) {
      case 'basic':
        return '基本職'
      case 'advanced':
        return '上級職'
      case 'special':
        return '特殊職'
      default:
        return '不明'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">職業管理</h1>
            </div>
            <div className="flex items-center space-x-2">
              <a href="/dashboard" className="text-blue-500 hover:text-blue-700">ダッシュボード</a>
              <a href="/users" className="text-blue-500 hover:text-blue-700">ユーザー管理</a>
              <a href="/players" className="text-blue-500 hover:text-blue-700">プレイヤー管理</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  職業一覧 ({jobClasses.length}種類)
                </h3>
                <button
                  onClick={fetchJobClasses}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  更新
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobClasses.map((jobClass) => (
                  <div key={jobClass.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{jobClass.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getJobTypeColor(jobClass.job_type)}`}>
                        {getJobTypeName(jobClass.job_type)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>最大レベル:</span>
                        <span className="font-medium">{jobClass.max_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>経験値倍率:</span>
                        <span className="font-medium">x{jobClass.experience_multiplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>習得プレイヤー数:</span>
                        <span className="font-medium text-blue-600">{jobClass.players_count}人</span>
                      </div>
                    </div>
                    
                    {jobClass.description && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{jobClass.description}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-400">
                      作成日: {new Date(jobClass.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}