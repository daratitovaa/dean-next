import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { markAsRead } from './actions'
import Link from 'next/link'

const TYPE_ICONS: Record<string, string> = {
  schedule: '📅',
  deadline: '⏰',
  dean: '🏛️',
  grade: '📝',
}

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Получаем уведомления текущего пользователя (RLS сам отфильтрует нужные)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  // Разделяем на непрочитанные и прочитанные
  const unread = notifications?.filter(n => !n.is_read) || []
  const read = notifications?.filter(n => n.is_read) || []

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← Назад</Link>
      <h1 className="text-lg font-semibold">Уведомления</h1>

      {/* БЛОК НОВЫХ УВЕДОМЛЕНИЙ */}
      {unread.length > 0 && (
        <div>
          <h2 className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wider">Новые</h2>
          <div className="bg-white rounded-xl border divide-y border-blue-100">
            {unread.map((n) => (
              <form key={n.id} action={markAsRead} className="block w-full">
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0">{TYPE_ICONS[n.type] || '📌'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
                      {n.body && <p className="text-sm text-zinc-600 mt-1">{n.body}</p>}
                      <p className="text-xs text-blue-500/70 mt-2 font-medium">Нажмите, чтобы отметить прочитанным</p>
                    </div>
                  </div>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* БЛОК ПРОЧИТАННЫХ УВЕДОМЛЕНИЙ */}
      {read.length > 0 && (
        <div>
          <h2 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Прочитанные</h2>
          <div className="bg-white rounded-xl border divide-y">
            {read.map((n) => (
              <div key={n.id} className="p-4 opacity-70">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0 grayscale">{TYPE_ICONS[n.type] || '📌'}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-800">{n.title}</p>
                    {n.body && <p className="text-sm text-zinc-600 mt-1">{n.body}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ПУСТОЕ СОСТОЯНИЕ */}
      {unread.length === 0 && read.length === 0 && (
         <div className="bg-white rounded-xl border p-8 text-center">
           <p className="text-4xl mb-2">✨</p>
           <p className="text-sm text-zinc-500">У вас нет уведомлений. Отдыхайте!</p>
         </div>
      )}
    </div>
  )
}