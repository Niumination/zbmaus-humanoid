import { useEffect, useState, useRef } from 'react'
import { EntryScreen } from './components/EntryScreen'
import { HumanoidMode } from './components/HumanoidMode'
import { readTuning } from './lib/humTuning'

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  time: string
}

const STATES = ['idle', 'listening', 'thinking', 'speaking', 'strong']

export function App() {
  const [entered, setEntered] = useState(
    () => typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('auto')
  )
  const [state, setState] = useState<string>('idle')
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Halo! Saya zbmaus-humanoid. Silakan berinteraksi dengan saya.', time: new Date().toLocaleTimeString('id-ID') }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = readTuning()
    setState(t.state)
  }, [])

  useEffect(() => {
    const h = (e: Event) => setState(String((e as CustomEvent).detail))
    window.addEventListener('hum:set-state', h as EventListener)
    return () => window.removeEventListener('hum:set-state', h as EventListener)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', text: input, time: new Date().toLocaleTimeString('id-ID') }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, state }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Maaf, saya tidak bisa memproses pesan ini.', time: new Date().toLocaleTimeString('id-ID') }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Terjadi kesalahan jaringan. Silakan coba lagi.', time: new Date().toLocaleTimeString('id-ID') }])
    } finally {
      setLoading(false)
    }
  }

  const changeState = (newState: string) => {
    setState(newState)
    window.dispatchEvent(new CustomEvent('hum:set-state', { detail: newState }))
    setMessages(prev => [...prev, { role: 'bot', text: `State diubah ke: ${newState}`, time: new Date().toLocaleTimeString('id-ID') }])
  }

  if (!entered) {
    return <EntryScreen onEnter={() => setEntered(true)} />
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <HumanoidMode state={state} onExit={() => setEntered(false)} />

      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: '#4f46e5',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}
      >
        {chatOpen ? '\u2715' : '\uD83D\uDCAC'}
      </button>

      {chatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '360px',
          maxWidth: 'calc(100vw - 40px)',
          height: '500px',
          maxHeight: 'calc(100vh - 120px)',
          background: 'rgba(0,0,0,0.85)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 999,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
            zbmaus-humanoid \u2014 Chat
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: m.role === 'user' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '13px',
                  lineHeight: '1.4',
                }}>
                  {m.text}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.time}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '13px' }}>
                  Sedang berpikir...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {STATES.map(s => (
              <button
                key={s}
                onClick={() => changeState(s)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: state === s ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Ketik pesan..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#4f46e5',
                color: 'white',
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
