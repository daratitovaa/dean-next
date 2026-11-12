'use client'

import { useState } from 'react'

export function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      const reply = data.reply || data.error || 'Ошибка'
      setMessages((m) => [...m, { role: 'ai', text: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Ошибка сети' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-x-4 bottom-24 sm:inset-auto sm:right-6 sm:bottom-24 sm:w-96 bg-white border rounded-2xl shadow-xl z-50 flex flex-col max-h-[70vh]">
          <div className="flex items-center justify-between p-3 border-b">
            <p className="text-sm font-medium">ИИ-ассистент</p>
            <button onClick={() => setOpen(false)} className="text-zinc-400 text-lg leading-none">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
            {messages.length === 0 && (
              <p className="text-xs text-zinc-400">Спроси: «Когда у меня физика?» или «Сколько у меня троек?»</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg max-w-[90%] ${
                  m.role === 'user' ? 'bg-zinc-900 text-white ml-auto' : 'bg-zinc-100'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <p className="text-xs text-zinc-400">Печатает...</p>}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Вопрос..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-4 bottom-24 sm:bottom-6 w-14 h-14 rounded-full bg-zinc-900 text-white shadow-lg z-40 flex items-center justify-center text-xl hover:bg-zinc-800 transition-colors"
        aria-label="Спросить ИИ"
      >
        💬
      </button>
    </>
  )
}