import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Empty message' }, { status: 400 })
  }

  const [scheduleRes, gradesRes, profileRes] = await Promise.all([
    supabase.from('schedule').select('*').order('day_of_week').order('start_time'),
    supabase.from('grades').select('*'),
    supabase.from('profiles').select('*').single(),
  ])

  const days = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const scheduleText = (scheduleRes.data ?? [])
    .map((l) => `${days[l.day_of_week]} ${l.start_time.slice(0, 5)}–${l.end_time.slice(0, 5)}: ${l.subject}, ${l.room}, ${l.teacher}`)
    .join('\n') || 'Расписание пустое'

  const gradesText = (gradesRes.data ?? [])
    .map((g) => `${g.subject}: ${g.grade ?? '—'} (${g.status})`)
    .join('\n') || 'Оценок нет'

  const context = `
Студент: ${profileRes.data?.full_name ?? 'Неизвестно'}, группа ${profileRes.data?.group_code ?? '—'}.

Расписание:
${scheduleText}

Оценки:
${gradesText}
`

  const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt-lite/latest`,
      completionOptions: { stream: false, temperature: 0.3, maxTokens: 500 },
      messages: [
        {
          role: 'system',
          text: `Ты — ассистент студента. Отвечай кратко на основе данных.\n\n${context}`,
        },
        { role: 'user', text: message },
      ],
    }),
  })

  // ДОБАВЬ ЭТИ СТРОКИ:
  console.log('YANDEX STATUS:', response.status)
  const responseText = await response.text()
  console.log('YANDEX BODY:', responseText)

  if (!response.ok) {
    return NextResponse.json({ error: 'YandexGPT error', details: responseText }, { status: 500 })
  }

  const data = JSON.parse(responseText)
  const reply = data.result?.alternatives?.[0]?.message?.text ?? 'Не удалось получить ответ'
  return NextResponse.json({ reply })
}