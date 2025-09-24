'use client'

import { useUserRole } from '@/hooks/useUserRole'
import { UserRole } from '@/types'
import { useState } from 'react'
import HostApplicationModal from './HostApplicationModal'

export default function RoleSelector() {
  const { userRole, roleLoading, isVisitor } = useUserRole()
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  if (roleLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-600">読み込み中...</span>
      </div>
    )
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'host':
        return 'bg-blue-100 text-blue-800'
      case 'visitor':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '管理者'
      case 'host':
        return '主催者'
      case 'visitor':
        return '来場者'
      default:
        return '不明'
    }
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
            userRole
          )}`}
        >
          {getRoleLabel(userRole)}
        </span>

        {isVisitor && (
          <button
            onClick={() => setShowApplicationModal(true)}
            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            主催者申請
          </button>
        )}
      </div>

      {showApplicationModal && (
        <HostApplicationModal
          onClose={() => setShowApplicationModal(false)}
          onSubmit={() => {
            setShowApplicationModal(false)
            // 申請完了後の処理
          }}
        />
      )}
    </>
  )
}