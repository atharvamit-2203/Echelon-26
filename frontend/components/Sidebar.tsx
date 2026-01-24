'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '🏠 Home', icon: '🏠' },
    { href: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/analytics', label: '📈 Analytics', icon: '📈' },
    { href: '/about', label: 'ℹ️ About', icon: 'ℹ️' },
    { href: '/contact', label: '📧 Contact', icon: '📧' },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-primary to-purple-800 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">🔍 Fair-Hire</h1>
        <p className="text-sm opacity-90">Sentinel</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-white text-primary font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-white/20">
        <div className="text-sm opacity-80">
          <div className="mb-2">Status: 🟢 Active</div>
          <div>Last Updated: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </aside>
  )
}
