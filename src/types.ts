export interface Message {
  id: string
  text: string
  outgoing: boolean
  /** Время в миллисекундах */
  timestamp: number
}

export interface Chat {
  /** chatId пользователя Telegram в GREEN-API, например "10000000" */
  id: string
  title: string
  messages: Message[]
}
