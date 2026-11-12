import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/bottom-nav' // Добавлен импорт

export const metadata: Metadata = {
  title: 'Деканат.Next — концепт',
  description: 'Концепт личного кабинета студента для конкурса. Не официальный сервис вуза.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-zinc-50 text-zinc-900 antialiased">
        <main className="pb-16 sm:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}