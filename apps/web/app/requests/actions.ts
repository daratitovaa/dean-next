'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const type = formData.get('type') as string
  await supabase.from('requests').insert({
    user_id: user.id,
    request_type: type,
    status: 'queued',
  })
  revalidatePath('/requests')
}

export async function createTransferRequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const subject = formData.get('subject') as string
  const requested_date = formData.get('date') as string
  const requested_time = formData.get('time') as string

  await supabase.from('requests').insert({
    user_id: user.id,
    request_type: 'Перенос пары',
    status: 'queued',
    subject,
    requested_date,
    requested_time
  })
  
  revalidatePath('/requests')
}

// НОВАЯ ФУНКЦИЯ ДЛЯ ИНДИВИДУАЛЬНОЙ ТРАЕКТОРИИ
export async function createITORequest(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const subject = formData.get('subject') as string
  const reason = formData.get('reason') as string
  const format_preference = formData.get('format') as string

  await supabase.from('requests').insert({
    user_id: user.id,
    request_type: 'Индивидуальная траектория',
    status: 'queued',
    subject,
    reason,
    format_preference
  })
  
  revalidatePath('/requests')
}