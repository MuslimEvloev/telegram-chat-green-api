import { useMemo, useState, type FormEvent } from 'react'
import {
  createGreenApi,
  getErrorMessage,
  isIncomingMessage,
  type Credentials,
} from '../../api/greenApi'
import { useNotifications } from '../../hooks/useNotifications'
import type { Chat, Message } from '../../types'
import { cx, formatTime, normalizePhone } from '../../utils'
import { Avatar } from '../Avatar/Avatar'
import { ChatWindow } from '../ChatWindow/ChatWindow'
import styles from './Messenger.module.css'

interface MessengerProps {
  credentials: Credentials
  onLogout: () => void
}

function createOutgoingMessage(id: string, text: string): Message {
  return { id, text, outgoing: true, timestamp: Date.now() }
}

export function Messenger({ credentials, onLogout }: MessengerProps) {
  const api = useMemo(() => createGreenApi(credentials), [credentials])
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const activeChat = chats.find((chat) => chat.id === activeChatId)

  /** Добавляет сообщение в чат (если чата нет — создаёт его) и поднимает чат наверх списка */
  function addMessage(chatId: string, title: string, message: Message) {
    setChats((prev) => {
      const chat = prev.find((item) => item.id === chatId)
      // Уведомление может прийти повторно, если удалить его из очереди не получилось
      if (chat?.messages.some((item) => item.id === message.id)) return prev
      const updated = {
        id: chatId,
        title: chat?.title ?? title,
        messages: [...(chat?.messages ?? []), message],
      }
      return [updated, ...prev.filter((item) => item.id !== chatId)]
    })
  }

  useNotifications(api, (body) => {
    if (!isIncomingMessage(body)) return
    const { textMessageData, extendedTextMessageData } = body.messageData
    const text = textMessageData?.textMessage ?? extendedTextMessageData?.text
    if (text === undefined) return // поддерживаются только текстовые сообщения

    const { chatId, chatName, senderName } = body.senderData
    addMessage(chatId, chatName || senderName || chatId, {
      id: body.idMessage,
      text,
      outgoing: false,
      timestamp: body.timestamp * 1000,
    })
  })

  async function handleCreateChat(event: FormEvent) {
    event.preventDefault()
    const phoneNumber = normalizePhone(phone)
    if (!/^\d{10,15}$/.test(phoneNumber)) {
      setPhoneError('Введите номер в международном формате, например 79991234567')
      return
    }
    setIsCreating(true)
    setPhoneError('')
    try {
      // Ответы приходят с числовым chatId Telegram, поэтому сначала узнаём его по номеру
      const { exist, chatId } = await api.checkAccount(Number(phoneNumber))
      if (!exist) throw new Error('Пользователь с таким номером не найден в Telegram')
      setChats((prev) =>
        prev.some((chat) => chat.id === chatId)
          ? prev
          : [{ id: chatId, title: `+${phoneNumber}`, messages: [] }, ...prev],
      )
      setActiveChatId(chatId)
      setPhone('')
    } catch (error) {
      setPhoneError(getErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  async function handleSend(text: string) {
    if (!activeChat) return
    const { idMessage } = await api.sendMessage(activeChat.id, text)
    addMessage(activeChat.id, activeChat.title, createOutgoingMessage(idMessage, text))
  }

  return (
    <div className={cx(styles.layout, activeChat && styles.chatOpen)}>
      <aside className={styles.sidebar}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onLogout}
            title="Выйти"
            aria-label="Выйти"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M9 16l-4-4 4-4M5 12h10" />
            </svg>
          </button>
          <form className={styles.newChat} onSubmit={handleCreateChat}>
            <input
              className={styles.phoneInput}
              type="tel"
              placeholder="Номер телефона"
              aria-label="Номер телефона получателя"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <button
              type="submit"
              className={styles.createButton}
              disabled={isCreating}
              title="Создать чат"
              aria-label="Создать чат"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </form>
        </header>
        {phoneError && <p className={styles.error}>{phoneError}</p>}

        {chats.length === 0 ? (
          <p className={styles.empty}>Введите номер телефона получателя, чтобы создать чат</p>
        ) : (
          <ul className={styles.list}>
            {chats.map((chat) => {
              const lastMessage = chat.messages.at(-1)
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    className={cx(styles.chatItem, chat.id === activeChatId && styles.active)}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <Avatar id={chat.id} title={chat.title} />
                    <span className={styles.chatInfo}>
                      <span className={styles.chatTop}>
                        <span className={styles.chatTitle}>{chat.title}</span>
                        {lastMessage && (
                          <span className={styles.chatTime}>{formatTime(lastMessage.timestamp)}</span>
                        )}
                      </span>
                      <span className={styles.chatPreview}>
                        {lastMessage
                          ? `${lastMessage.outgoing ? 'Вы: ' : ''}${lastMessage.text}`
                          : 'Нет сообщений'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </aside>

      <main className={styles.main}>
        {activeChat ? (
          <ChatWindow
            key={activeChat.id}
            chat={activeChat}
            onSend={handleSend}
            onBack={() => setActiveChatId(null)}
          />
        ) : (
          <div className={cx(styles.placeholder, 'wallpaper')}>
            <span>Выберите чат или создайте новый</span>
          </div>
        )}
      </main>
    </div>
  )
}
