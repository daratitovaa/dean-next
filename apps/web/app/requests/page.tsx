import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createRequest, createTransferRequest, createITORequest } from './actions'
import { AiAssistant } from '@/components/ai-assistant'
export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  queued: 'В очереди',
  processing: 'Готовится',
  ready: 'Готова',
  issued: 'Выдана',
}

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-zinc-100 text-zinc-700',
  processing: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  issued: 'bg-blue-100 text-blue-700',
}

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Получаем заявки
  const { data: requests } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })

  // Получаем расписание для выпадающего списка
  const { data: lessons } = await supabase
    .from('schedule')
    .select('*')
    .order('day_of_week')
    .order('start_time')

  // Фильтруем дубликаты предметов
  const uniqueLessons = lessons?.filter((lesson, index, self) =>
    index === self.findIndex((l) => l.subject === lesson.subject)
  ) || []

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-4">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← Назад</Link>
      <h1 className="text-lg font-semibold">Заявки и справки</h1>

      {/* БЛОК ЗАКАЗА СПРАВОК */}
      <div className="bg-white rounded-xl border p-4 space-y-2">
        <h2 className="text-sm font-medium mb-1">Заказать справку</h2>
        <form action={createRequest}>
          <input type="hidden" name="type" value="Справка об обучении" />
          <button
            type="submit"
            className="w-full text-left px-3 py-2 border rounded-lg text-sm hover:bg-zinc-50"
          >
            Справка об обучении
          </button>
        </form>
        <form action={createRequest}>
          <input type="hidden" name="type" value="Справка для военкомата" />
          <button
            type="submit"
            className="w-full text-left px-3 py-2 border rounded-lg text-sm hover:bg-zinc-50"
          >
            Справка для военкомата
          </button>
        </form>
      </div>

      {/* БЛОК: ЗАПРОС ПЕРЕНОСА ПАРЫ (оставлен, если нужен) */}
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <h2 className="text-sm font-medium mb-1">Запросить перенос пары</h2>
        <form action={createTransferRequest} className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Предмет</label>
            <select name="subject" required className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-zinc-900 outline-none">
              <option value="">Выберите пару</option>
              {uniqueLessons.map((l) => (
                <option key={l.id} value={l.subject}>
                  {l.subject} ({l.start_time.slice(0,5)})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Желаемая дата</label>
              <input type="date" name="date" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Время</label>
              <input type="time" name="time" required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Отправить запрос
          </button>
        </form>
      </div>

      {/* НОВЫЙ БЛОК: ИНДИВИДУАЛЬНАЯ ТРАЕКТОРИЯ (ИТО) */}
      <div className="bg-white rounded-xl border p-4 space-y-4">
        <div>
          <h2 className="text-sm font-medium">Индивидуальная траектория обучения (ИТО)</h2>
          <p className="text-xs text-zinc-500 mt-1">Запросите особый формат обучения по дисциплине (например, свободное посещение из-за работы или спорта).</p>
        </div>
        
        <form action={createITORequest} className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Дисциплина</label>
            <select name="subject" required className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-zinc-900 outline-none">
              <option value="">Выберите предмет</option>
              {uniqueLessons.map((l) => (
                <option key={l.id} value={l.subject}>{l.subject}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Желаемый формат</label>
            <select name="format" required className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-zinc-900 outline-none">
              <option value="Свободное посещение">Свободное посещение</option>
              <option value="Удаленный формат">Удаленный формат (онлайн)</option>
              <option value="Смешанный формат">Смешанный формат</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Обоснование</label>
            <textarea 
              name="reason" 
              required 
              placeholder="Например: Совмещаю учебу с работой по вечерам..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none resize-none"
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Отправить запрос
          </button>
        </form>
      </div>

      {/* СПИСОК МОИХ ЗАЯВОК */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-sm font-medium mb-3">Мои заявки</h2>
        <div className="space-y-2">
          {requests?.length === 0 && (
            <p className="text-sm text-zinc-400">Заявок пока нет</p>
          )}
          {requests?.map((r) => (
            <div key={r.id} className="flex flex-col p-3 rounded-lg bg-zinc-50 gap-1 border border-zinc-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{r.request_type}</p>
                <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 uppercase tracking-wider font-semibold ${STATUS_COLORS[r.status] || ''}`}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
              </div>
              
              {/* Детали для переноса пары */}
              {r.request_type === 'Перенос пары' && r.subject && (
                <p className="text-xs text-zinc-600 mt-1">
                  {r.subject} → {new Date(r.requested_date).toLocaleDateString('ru-RU')} в {r.requested_time?.slice(0, 5)}
                </p>
              )}

              {/* Детали для ИТО */}
              {r.request_type === 'Индивидуальная траектория' && (
                <div className="mt-1">
                  {r.subject && (
                    <p className="text-xs text-indigo-600 font-medium">
                      {r.subject} · {r.format_preference}
                    </p>
                  )}
                  {r.reason && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2" title={r.reason}>
                      Причина: {r.reason}
                    </p>
                  )}
                </div>
              )}

              <p className="text-[11px] text-zinc-400 mt-1">
                Создана: {new Date(r.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AiAssistant />
    </div>
  )
}