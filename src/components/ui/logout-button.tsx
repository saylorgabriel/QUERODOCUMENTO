'use client'

import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/simple-logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors duration-200"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  )
}