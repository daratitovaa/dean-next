'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAsRead(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id')
  if (!id) return

  // Обновляем только если это уведомление текущего пользователя
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Ошибка обновления уведомления:', error)
    throw new Error('Не удалось обновить уведомление')
  }

  revalidatePath('/notifications')
  revalidatePath('/') // Обновляем и главную, если там есть счетчик непрочитанных
}