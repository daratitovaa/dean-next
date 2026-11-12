'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function selectTopic(topicId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Пытаемся вставить выбор
  const { error } = await supabase
    .from('coursework_choices')
    .insert({ user_id: user.id, topic_id: topicId })

  // Если сработал UNIQUE constraint — значит, тему уже заняли!
  if (error) {
    if (error.code === '23505') {
      return { error: 'Эта тема уже занята другим студентом!' }
    }
    return { error: 'Произошла ошибка при выборе темы.' }
  }

  revalidatePath('/coursework')
  return { success: true }
}

export async function cancelChoice() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('coursework_choices').delete().eq('user_id', user.id)
  revalidatePath('/coursework')
}