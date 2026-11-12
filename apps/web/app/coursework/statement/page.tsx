import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StatementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()
  
  const { data: choice } = await supabase
    .from('coursework_choices')
    .select('*, coursework_topics(*)')
    .eq('user_id', user.id)
    .single()

  if (!choice) {
    return <div className="p-8 text-center">Вы еще не выбрали тему. <Link href="/coursework" className="text-blue-600 underline">Вернуться</Link></div>
  }

  const topic = choice.coursework_topics

  return (
    <div className="min-h-screen bg-zinc-100 py-10 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl p-10 print:shadow-none print:p-0 font-serif text-black text-[14px] leading-relaxed relative">
        
        {/* Кнопки управления (скрываются при печати) */}
        <div className="absolute top-4 right-4 print:hidden flex gap-3">
          <Link href="/coursework" className="text-sm text-zinc-500 hover:text-zinc-800">Назад</Link>
          <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700" onClick={undefined} id="print-btn">
            Сохранить в PDF
          </button>
        </div>

        <div className="mt-16 text-center font-bold text-base mb-10">
          ЗАЯВЛЕНИЕ
        </div>

        <div className="text-right mb-10">
          <p>Декану факультета</p>
          <p>Института информационных технологий</p>
          <p className="mt-4">студента {profile?.course} курса</p>
          <p>группы {profile?.group_code}</p>
          <p>{profile?.full_name}</p>
        </div>

        <p className="indent-12 text-justify mb-4">
          Прошу закрепить за мной тему курсовой работы по дисциплине «{topic.discipline}»:
        </p>
        <p className="text-center font-bold my-6">
          «{topic.title}»
        </p>
        <p className="indent-12 text-justify mb-12">
          Научный руководитель: {topic.teacher}.
        </p>

        <div className="flex justify-between items-end mt-24">
          <div>
            <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
          </div>
          <div className="text-right">
            <p>Подпись студента _______________</p>
          </div>
        </div>
      </div>

      {/* Скрипт для вызова окна печати */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('print-btn').addEventListener('click', () => window.print());
        `
      }} />
    </div>
  )
}