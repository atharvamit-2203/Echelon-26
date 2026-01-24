'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, BarChart3, AlertTriangle, Info } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'About', path: '/about', icon: Info }
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-cyan-400" />
          <span className="text-xl font-bold text-white">Fair-Hire Sentinel</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}