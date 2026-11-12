import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { selectTopic, cancelChoice } from './actions'
import { TopicSelector } from './TopicSelector'

export default async function CourseworkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Загружаем все темы
  const { data: topics } = await supabase
    .from('coursework_topics')
    .select('*')
    .order('id')

  // Загружаем все выборы (чтобы понять, какие темы заняты)
  const { data: choices } = await supabase
    .from('coursework_choices')
    .select('*, profiles(full_name, group_code)')

  const myChoice = choices?.find(c => c.user_id === user.id)
  const myTopic = topics?.find(t => t.id === myChoice?.topic_id)

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">← На главную</Link>
      
      <div>
        <h1 className="text-xl font-bold">Курсовая работа</h1>
        <p className="text-sm text-zinc-500 mt-1">Выберите тему из списка ниже. Занятые темы недоступны.</p>
      </div>

      {/* Блок с текущим выбором */}
      {myChoice && myTopic && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h2 className="font-semibold text-green-900">Ваша тема закреплена</h2>
          </div>
          <div>
            <p className="font-medium text-lg">{myTopic.title}</p>
            <p className="text-sm text-green-800 mt-1">Научный руководитель: {myTopic.teacher}</p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Link 
              href="/coursework/statement"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              📄 Скачать заявление (PDF)
            </Link>
            <form action={async () => {
              'use server'
              await cancelChoice()
            }}>
              <button className="text-sm text-red-600 hover:underline px-2 py-2">
                Отменить выбор
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Список тем */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="text-left font-medium p-3 text-zinc-600">Тема</th>
              <th className="text-left font-medium p-3 text-zinc-600">Преподаватель</th>
              <th className="text-right font-medium p-3 text-zinc-600">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topics?.map((t) => {
              const isTaken = choices?.some(c => c.topic_id === t.id)
              const takenByMe = myChoice?.topic_id === t.id
              
              return (
                <tr key={t.id} className={isTaken ? 'bg-zinc-50/50' : 'hover:bg-zinc-50/50 transition'}>
                  <td className="p-3">
                    <p className={`font-medium ${isTaken && !takenByMe ? 'text-zinc-400' : 'text-zinc-900'}`}>
                      {t.title}
                    </p>
                    {isTaken && !takenByMe && (
                      <p className="text-xs text-zinc-400 mt-0.5">Занята другим студентом</p>
                    )}
                  </td>
                  <td className="p-3 text-zinc-600">{t.teacher}</td>
                  <td className="p-3 text-right">
                    {!myChoice && !isTaken && (
                      <TopicSelector topicId={t.id} action={selectTopic} />
                    )}
                    {takenByMe && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Ваша</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}