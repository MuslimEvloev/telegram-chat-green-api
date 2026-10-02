// Клиент GREEN-API для Telegram: https://green-api.com/telegram/docs/api/

export interface Credentials {
  idInstance: string
  apiTokenInstance: string
}

/** Уведомление о входящем сообщении (оставлены только нужные поля) */
export interface IncomingMessage {
  typeWebhook: 'incomingMessageReceived'
  idMessage: string
  timestamp: number
  senderData: {
    chatId: string
    chatName: string
    senderName: string
  }
  messageData: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}

export interface Notification {
  receiptId: number
  body: IncomingMessage | { typeWebhook: string }
}

/** Сколько секунд сервер держит запрос ReceiveNotification, ожидая новое уведомление */
const RECEIVE_TIMEOUT_SEC = 20

export function createGreenApi({ idInstance, apiTokenInstance }: Credentials) {
  // Хост определяется по первым 4 цифрам idInstance: 4100123456 → https://4100.api.green-api.com
  const apiUrl = `https://${idInstance.slice(0, 4)}.api.green-api.com`

  async function request<T>(method: string, init?: RequestInit, suffix = ''): Promise<T> {
    const url = `${apiUrl}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
    let response: Response
    try {
      response = await fetch(url, init)
    } catch (error) {
      if (init?.signal?.aborted) throw error
      // Сюда попадают и обрывы сети, и ответы сервера без CORS-заголовков (например, пока инстанс запускается)
      throw new Error(
        'GREEN-API не ответил. Проверьте интернет и что инстанс в личном кабинете в статусе «Авторизован»',
      )
    }
    if (!response.ok) throw new Error(describeStatus(response.status))
    const text = await response.text()
    return (text ? JSON.parse(text) : null) as T
  }

  function post<T>(method: string, body: object): Promise<T> {
    return request<T>(method, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  return {
    getStateInstance: () => request<{ stateInstance: string }>('getStateInstance'),

    getSettings: () => request<{ webhookUrl: string; incomingWebhook: string }>('getSettings'),

    /** Узнать chatId пользователя Telegram по номеру телефона */
    checkAccount: (phoneNumber: number) =>
      post<{ exist: boolean; chatId: string }>('checkAccount', { phoneNumber }),

    sendMessage: (chatId: string, message: string) =>
      post<{ idMessage: string }>('sendMessage', { chatId, message }),

    /** Возвращает null, если за RECEIVE_TIMEOUT_SEC секунд уведомлений не появилось */
    receiveNotification: (signal: AbortSignal) =>
      request<Notification | null>(
        'receiveNotification',
        { signal },
        `?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`,
      ),

    deleteNotification: (receiptId: number) =>
      request<{ result: boolean }>('deleteNotification', { method: 'DELETE' }, `/${receiptId}`),
  }
}

export type GreenApi = ReturnType<typeof createGreenApi>

export function isIncomingMessage(body: Notification['body']): body is IncomingMessage {
  return body.typeWebhook === 'incomingMessageReceived'
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function describeStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Неверный idInstance или apiTokenInstance'
    case 403:
      return 'Доступ запрещён: проверьте, что инстанс активен'
    case 429:
      return 'Слишком много запросов, попробуйте позже'
    case 466:
      return 'Исчерпан лимит тарифа GREEN-API'
    default:
      return `Ошибка GREEN-API (код ${status})`
  }
}
