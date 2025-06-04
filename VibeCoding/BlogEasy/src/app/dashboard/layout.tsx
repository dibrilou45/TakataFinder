'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, BarChart, Target, LogOut, Menu, X } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Plus besoin de vérifier l'authentification - mode ouvert

  const handleLogout = () => {
    // Redirection simple vers la page d'accueil sans déconnexion
    router.push('/')
  }

  const navItems = [
    {
      icon: Target,
      label: 'Sélection des topics',
      href: '/dashboard/topics',
    },
    {
      icon: FileText,
      label: 'Articles',
      href: '/dashboard/articles',
    },
    {
      icon: BarChart,
      label: 'Analyse SEO',
      href: '/dashboard/analyze',
    },
  ]

  // Mode ouvert - pas de vérification d'authentification

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar pour desktop */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform bg-white shadow-sm transition-transform md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div>
            <div className="mb-8 flex items-center space-x-2 px-2">
              <Sparkles className="h-6 w-6 text-turquoise" />
              <span className="text-xl font-bold">BlogEasy</span>
              <button
                className="ml-auto block md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${isActive ? 'bg-turquoise/10 text-turquoise' : 'hover:bg-gray-100'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-turquoise" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-turquoise/10 text-turquoise">
                  U
                </div>
                <div>
                  <p className="font-medium">Utilisateur</p>
                  <p className="text-sm text-gray-500">Mode ouvert</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start space-x-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay pour fermer le sidebar sur mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <button
              className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Mode Développement
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
