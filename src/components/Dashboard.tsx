'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface DashboardData {
  stats: {
    total_admin_users: number
    active_admin_users: number
    inactive_admin_users: number
    total_permissions: number
    active_permissions: number
    total_users: number
    active_users: number
    total_players: number
    active_players: number
    total_job_classes: number
    active_job_classes: number
    basic_jobs: number
    advanced_jobs: number
    special_jobs: number
  }
  recent_logins: Array<{
    id: number
    name: string
    email: string
    role: string
    last_login_at: string
  }>
  system_info: {
    rails_version: string
    ruby_version: string
    environment: string
    database_adapter: string
  }
  current_admin: {
    id: number
    name: string
    role: string
    last_login_at: string
    permissions_count: number
  }
  job_classes: Array<{
    id: number
    name: string
    job_type: string
    max_level: number
  }>
  recent_activity: {
    new_users_today: number
    new_players_today: number
    active_players_today: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const dashboardData = await apiClient.getDashboard()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">エラー: {error}</div>
        <button
          onClick={fetchDashboardData}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
        >
          再試行
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総ユーザー数</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.stats.total_users}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総プレイヤー数</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.stats.total_players}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">J</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">職業数</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.stats.total_job_classes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">管理者数</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.stats.total_admin_users}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 今日のアクティビティ */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">今日のアクティビティ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.recent_activity.new_users_today}</div>
              <div className="text-sm text-gray-500">新規ユーザー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.recent_activity.new_players_today}</div>
              <div className="text-sm text-gray-500">新規プレイヤー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.recent_activity.active_players_today}</div>
              <div className="text-sm text-gray-500">アクティブプレイヤー</div>
            </div>
          </div>
        </div>
      </div>

      {/* 職業統計 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">職業統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.stats.basic_jobs}</div>
              <div className="text-sm text-gray-500">基本職</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.stats.advanced_jobs}</div>
              <div className="text-sm text-gray-500">上級職</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.stats.special_jobs}</div>
              <div className="text-sm text-gray-500">特殊職</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">職業名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最大レベル</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.job_classes.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.job_type === 'basic' ? 'bg-green-100 text-green-800' :
                        job.job_type === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {job.job_type === 'basic' ? '基本職' : 
                         job.job_type === 'advanced' ? '上級職' : '特殊職'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.max_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 最近のログイン */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">最近の管理者ログイン</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メール</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">権限</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終ログイン</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recent_logins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                        admin.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {admin.role === 'super_admin' ? 'スーパー管理者' :
                         admin.role === 'admin' ? '管理者' : 'モデレーター'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.last_login_at).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* システム情報 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">システム情報</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Rails バージョン</dt>
              <dd className="text-sm text-gray-900">{data.system_info.rails_version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ruby バージョン</dt>
              <dd className="text-sm text-gray-900">{data.system_info.ruby_version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">環境</dt>
              <dd className="text-sm text-gray-900">{data.system_info.environment}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">データベース</dt>
              <dd className="text-sm text-gray-900">{data.system_info.database_adapter}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}