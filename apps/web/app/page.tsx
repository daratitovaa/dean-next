import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AiAssistant } from '@/components/ai-assistant'
import { StressRelief } from '@/components/stress-relief'
import { GamificationProfile } from '@/components/gamification-profile'

export const dynamic = 'force-dynamic'
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()
  const { data: lessons } = await supabase
    .from('schedule')
    .select('*')
    .order('day_of_week')
    .order('start_time')

  // ДОБАВЛЕН ЗАПРОС ДОСТИЖЕНИЙ
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .order('unlocked_at', { ascending: false })

  const today = new Date().getDay() || 7
  const todayLessons = lessons?.filter((l) => l.day_of_week === today) ?? []

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
      
      {/* БЛОК ПРОФИЛЯ С АВАТАРКОЙ И ССЫЛКОЙ НА ПРОПУСК */}
      <div className="flex items-center justify-between mt-2">
        <Link href="/pass" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-lg shrink-0">
            {profile?.full_name?.charAt(0) || 'С'}
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">{profile?.full_name}</h1>
            <p className="text-sm text-zinc-500">{profile?.group_code} · Пропуск</p>
          </div>
        </Link>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-red-500 px-2 py-1">Выйти</button>
        </form>
      </div>

      {/* РАСПИСАНИЕ С КНОПКОЙ ЭКСПОРТА */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Расписание на сегодня</h2>
          <Link 
            href="/api/calendar" 
            className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            📅 В календарь
          </Link>
        </div>
        
        {todayLessons.length === 0 && (
          <p className="text-sm text-zinc-400 py-4 text-center">Сегодня занятий нет</p>
        )}
        <div className="space-y-2">
          {todayLessons.map((lesson) => (
            <div key={lesson.id} className="flex items-start gap-3 p-2 rounded-lg bg-zinc-50">
              <div className="text-sm font-mono text-zinc-500 w-14 shrink-0">
                {lesson.start_time.slice(0, 5)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{lesson.subject}</p>
                <p className="text-xs text-zinc-500">
                  {lesson.room} · {lesson.teacher}
                </p>
                {lesson.is_changed && (
                  <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    {lesson.change_note || 'Изменение'}
                  </span>
                )}
              </div>
              <span className="text-xs border rounded px-2 py-0.5 shrink-0">
                {lesson.lesson_type === 'lecture' ? 'Лек' :
                 lesson.lesson_type === 'practice' ? 'Практ' :
                 lesson.lesson_type === 'lab' ? 'Лаб' : 'Экз'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* БЛОК ГЕЙМИФИКАЦИИ */}
      <GamificationProfile 
        xp={profile?.xp || 0} 
        level={profile?.level || 1} 
        achievements={achievements || []} 
      />
      
      {/* ПОДКЛЮЧЕНИЕ КОМПОНЕНТОВ (ПЛАВАЮЩИЕ ЭЛЕМЕНТЫ) */}
      <AiAssistant />
      <StressRelief />
    </div>
  )
}