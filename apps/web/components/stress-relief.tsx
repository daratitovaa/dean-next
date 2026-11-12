'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  "Сессия пройдет, а знания останутся.",
  "Ты сдашь этот экзамен. Ты уже сдавал сложнее.",
  "Один шаг за раз. Начни с малого.",
  "Отдых — это часть учебы, а не наоборот.",
  "Оценки не определяют твою ценность."
]

export function StressRelief() {
  const [open, setOpen] = useState(false)
  const [quote, setQuote] = useState('')
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
      setStep(0)
      const interval = setInterval(() => {
        setStep((s) => (s + 1) % 4)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [open])

  const steps = ['Вдох...', 'Задержи...', 'Выдох...', 'Пауза...']

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        // ИЗМЕНЕНО: bottom-20 -> bottom-24
        className="fixed left-4 bottom-24 sm:bottom-6 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium shadow-lg z-40 hover:bg-indigo-200 transition-colors"
      >
        🍃 Перерыв
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center space-y-6 relative">
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 text-2xl leading-none"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold pt-2">Дыхательная практика</h3>
            
            {/* Анимированный круг */}
            <div className="flex justify-center items-center h-48">
              <div 
                className={`rounded-full bg-indigo-500/20 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                  step === 0 ? 'w-48 h-48' : step === 1 ? 'w-48 h-48' : step === 2 ? 'w-24 h-24' : 'w-24 h-24'
                }`}
              >
                <div 
                  className={`rounded-full bg-indigo-500 text-white flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                    step === 0 ? 'w-40 h-40' : step === 1 ? 'w-40 h-40' : step === 2 ? 'w-20 h-20' : 'w-20 h-20'
                  }`}
                >
                  <span className="text-sm font-medium">{steps[step]}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-zinc-600 italic">&quot;{quote}&quot;</p>
          </div>
        </div>
      )}
    </>
  )
}