import { useState, type FormEvent } from 'react'
import { createGreenApi, getErrorMessage, type Credentials } from '../../api/greenApi'
import styles from './Login.module.css'

interface LoginProps {
  onLogin: (credentials: Credentials) => void
}

export function Login({ onLogin }: LoginProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    setIsLoading(true)
    setError('')
    try {
      // Проверяем данные сразу, чтобы не пускать в чат с неверным токеном
      const api = createGreenApi(credentials)
      const { stateInstance } = await api.getStateInstance()
      if (stateInstance !== 'authorized') {
        throw new Error('Инстанс не авторизован в Telegram. Авторизуйте его в личном кабинете GREEN-API')
      }
      // Без этих настроек ReceiveNotification не вернёт входящие сообщения
      const { webhookUrl, incomingWebhook } = await api.getSettings()
      if (webhookUrl || incomingWebhook !== 'yes') {
        throw new Error(
          'Входящие сообщения не будут приходить: в настройках инстанса очистите webhookUrl и включите «Получать уведомления о входящих сообщениях и файлах»',
        )
      }
      onLogin(credentials)
    } catch (err) {
      setError(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.logo} aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3.5c4.97 0 9 3.6 9 8.05s-4.03 8.05-9 8.05c-1.1 0-2.15-.17-3.12-.5L4 20.5l1.15-3.9A7.6 7.6 0 0 1 3 11.55C3 7.1 7.03 3.5 12 3.5Z" />
          </svg>
        </div>
        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.subtitle}>
          Введите параметры инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>

        <label className={styles.field}>
          <input
            className={styles.input}
            placeholder=" "
            inputMode="numeric"
            pattern="\d+"
            required
            autoFocus
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
          />
          <span className={styles.label}>idInstance</span>
        </label>

        <label className={styles.field}>
          <input
            className={styles.input}
            type="password"
            placeholder=" "
            required
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
          />
          <span className={styles.label}>apiTokenInstance</span>
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
