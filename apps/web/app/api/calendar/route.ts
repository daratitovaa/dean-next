import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: lessons } = await supabase.from('schedule').select('*')

  // Формируем ICS
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Dean.Next//RU\n'
  
  lessons?.forEach((lesson) => {
    // В реальности даты нужно вычислять от текущей недели, 
    // но для концепта захардкодим ближайший понедельник
    const date = '20261109' // Пример: 9 ноября 2026
    const start = lesson.start_time.replace(/:/g, '') + '00'
    const end = lesson.end_time.replace(/:/g, '') + '00'

    ics += `BEGIN:VEVENT\n`
    ics += `SUMMARY:${lesson.subject}\n`
    ics += `LOCATION:${lesson.room}\n`
    ics += `DESCRIPTION:${lesson.teacher} (${lesson.lesson_type})\n`
    ics += `DTSTART:${date}T${start}\n`
    ics += `DTEND:${date}T${end}\n`
    ics += `END:VEVENT\n`
  })

  ics += 'END:VCALENDAR'

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="schedule.ics"',
    },
  })
}