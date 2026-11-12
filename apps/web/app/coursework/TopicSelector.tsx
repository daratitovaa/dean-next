'use client'

import { useState } from 'react'

export function TopicSelector({ topicId, action }: { topicId: number, action: (id: number) => Promise<any> }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSelect = async () => {
    setIsPending(true)
    setError(null)
    const res = await action(topicId)
    setIsPending(false)
    if (res?.error) {
      setError(res.error)
    }
  }

  if (error) {
    return <span className="text-xs text-red-500 max-w-[150px] inline-block text-right">{error}</span>
  }

  return (
    <button 
      onClick={handleSelect}
      disabled={isPending}
      className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
    >
      {isPending ? 'Бронирование...' : 'Выбрать'}
    </button>
  )
}