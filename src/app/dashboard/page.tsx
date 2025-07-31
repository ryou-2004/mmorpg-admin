'use client'

import AdminLayout from '@/components/AdminLayout'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  return (
    <AdminLayout title="MMORPG 管理画面">
      <Dashboard />
    </AdminLayout>
  )
}