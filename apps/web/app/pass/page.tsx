import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QRCode from 'react-qr-code'

export const dynamic = 'force-dynamic'

export default async function PassPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').single()

  // Генерируем уникальные данные для QR-кода (заглушка, но выглядит реалистично)
  const qrData = JSON.stringify({
    id: user.id,
    group: profile?.group_code,
    university: 'Dean.Next Concept',
  })

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-6 flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-lg font-semibold">Электронный пропуск</h1>
      
      {/* Карточка */}
      <div className="w-full bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Декоративные круги на фоне */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-widest">Студенческий билет</p>
              <h2 className="text-xl font-bold mt-1">Деканат.Next</h2>
            </div>
            {/* Логотип-заглушка */}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">🎓</div>
          </div>

          <div className="flex justify-between items-end mt-auto gap-4">
            <div className="min-w-0">
              <p className="text-xs text-zinc-400">Студент</p>
              <p className="font-medium text-sm truncate">{profile?.full_name}</p>
              
              <p className="text-xs text-zinc-400 mt-3">Группа</p>
              <p className="font-medium text-sm">{profile?.group_code}</p>
            </div>
            
            {/* QR-код */}
            <div className="bg-white p-2 rounded-xl shrink-0">
              <QRCode value={qrData} size={80} level="M" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-zinc-500">
        Покажите этот QR-код на вахте или в столовой. Данные обновляются автоматически.
      </p>

      <a href="/" className="text-sm text-blue-600">← На главную</a>
    </div>
  )
}