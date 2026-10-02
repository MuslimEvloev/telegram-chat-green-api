import { useEffect, useRef } from 'react'
import type { GreenApi, Notification } from '../api/greenApi'

const RETRY_DELAY_MS = 5000

/**
 * Получение уведомлений по технологии HTTP API: ReceiveNotification ждёт уведомление
 * (long polling), после обработки удаляем его из очереди через DeleteNotification
 * и сразу запрашиваем следующее.
 */
export function useNotifications(api: GreenApi, onNotification: (body: Notification['body']) => void) {
  const handlerRef = useRef(onNotification)
  useEffect(() => {
    handlerRef.current = onNotification
  })

  useEffect(() => {
    const controller = new AbortController()

    async function poll() {
      while (!controller.signal.aborted) {
        try {
          const notification = await api.receiveNotification(controller.signal)
          if (!notification) continue
          handlerRef.current(notification.body)
          await api.deleteNotification(notification.receiptId)
        } catch {
          if (controller.signal.aborted) return
          // Сервер или сеть недоступны — повторяем через несколько секунд
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }
    }

    void poll()
    return () => controller.abort()
  }, [api])
}
