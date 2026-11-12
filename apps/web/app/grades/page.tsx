import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AiAssistant } from '@/components/ai-assistant'

export const dynamic = 'force-dynamic'
export default async function GradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: grades } = await supabase.from('grades').select('*')
  const avg = grades?.length
    ? (grades.reduce((s, g) => s + (g.grade || 0), 0) / grades.length).toFixed(1)
    : '—'
  const debts = grades?.filter((g) => g.status === 'failed').length ?? 0

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
      <a href="/" className="text-sm text-zinc-500">← Назад</a>
      <h1 className="text-lg font-semibold">Успеваемость</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-zinc-500">Средний балл</p>
          <p className="text-3xl font-bold mt-1">{avg}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-zinc-500">Задолженности</p>
          <p className={`text-3xl font-bold mt-1 ${debts > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {debts}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-sm font-medium mb-3">Дисциплины</h2>
        <div className="space-y-2">
          {grades?.length === 0 && (
            <p className="text-sm text-zinc-400">Оценок пока нет</p>
          )}
          {grades?.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-2 rounded bg-zinc-50">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{g.subject}</p>
                <p className="text-xs text-zinc-500">{g.teacher} · {g.grade_type}</p>
              </div>
              <span
                className={`text-sm font-bold px-3 py-1 rounded shrink-0 ${
                  g.status === 'passed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {g.grade ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
     <AiAssistant />
    </div>
  )
}