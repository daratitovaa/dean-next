'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/', label: 'Главная', icon: '🏠' },
  { href: '/grades', label: 'Оценки', icon: '📊' },
  { href: '/requests', label: 'Заявки', icon: '📄' },
  { href: '/notifications', label: 'События', icon: '🔔' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-40 sm:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                active ? 'text-indigo-600' : 'text-zinc-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}