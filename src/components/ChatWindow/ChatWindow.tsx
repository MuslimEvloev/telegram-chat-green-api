import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getErrorMessage } from '../../api/greenApi'
import type { Chat } from '../../types'
import { cx, formatTime } from '../../utils'
import { Avatar } from '../Avatar/Avatar'
import styles from './ChatWindow.module.css'

interface ChatWindowProps {
  chat: Chat
  onSend: (text: string) => Promise<void>
  onBack: () => void
}

export function ChatWindow({ chat, onSend, onBack }: ChatWindowProps) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  // Держим ленту прокрученной к последнему сообщению
  useEffect(() => {
    const element = messagesRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [chat.messages.length])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const message = text.trim()
    if (!message || isSending) return
    setIsSending(true)
    setError('')
    try {
      await onSend(message)
      setText('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className={styles.chat}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="К списку чатов">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Avatar id={chat.id} title={chat.title} size={42} />
        <h2 className={styles.title}>{chat.title}</h2>
      </header>

      <div className={cx(styles.body, 'wallpaper')}>
        <div className={styles.messages} ref={messagesRef}>
          <div className={styles.column}>
            {chat.messages.map((message, index) => (
              <div
                key={message.id}
                className={cx(
                  styles.message,
                  message.outgoing ? styles.out : styles.in,
                  // «Хвостик» только у последнего сообщения в серии, как в Telegram
                  chat.messages[index + 1]?.outgoing !== message.outgoing && styles.tail,
                )}
              >
                <span className={styles.text}>{message.text}</span>
                <span className={styles.time}>{formatTime(message.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        <form className={styles.composer} onSubmit={handleSubmit}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.composerRow}>
            <input
              className={styles.input}
              placeholder="Сообщение"
              aria-label="Сообщение"
              maxLength={4096}
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button
              type="submit"
              className={styles.send}
              disabled={!text.trim() || isSending}
              aria-label="Отправить"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
