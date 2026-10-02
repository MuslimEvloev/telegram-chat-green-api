# Telegram-чат на GREEN-API

Тестовое задание на должность «Фронтенд-разработчик React»: веб-интерфейс для отправки и получения текстовых сообщений в Telegram через [GREEN-API](https://green-api.com/telegram/). Внешний вид — по мотивам Telegram Web.

## Возможности

1. Вход по `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API (данные проверяются методом [GetStateInstance](https://green-api.com/telegram/docs/api/account/GetStateInstance/)).
2. Создание чата по номеру телефона получателя: `chatId` определяется методом [CheckAccount](https://green-api.com/telegram/docs/api/service/CheckAccount/).
3. Отправка текстовых сообщений методом [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/).
4. Получение входящих текстовых сообщений по технологии [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/): ReceiveNotification + DeleteNotification.

Функциональность намеренно минимальная: только текст, история хранится до перезагрузки страницы.

## Локальный запуск

Нужен Node.js 20.19+ или 22.12+.

```bash
git clone <ссылка на репозиторий>
cd green-api-telegram-chat
npm install
npm run dev
```

Откройте http://localhost:5173.

Продакшен-сборка — `npm run build`, результат появится в `dist/`. Это статический сайт: его можно выложить на Vercel, Netlify, GitHub Pages или любой другой хостинг.

## Подготовка инстанса GREEN-API

1. Зарегистрируйтесь в [личном кабинете](https://console.green-api.com) и создайте инстанс Telegram (тариф «Разработчик» бесплатный).
2. Авторизуйте инстанс: войдите в свой аккаунт Telegram по QR-коду или номеру телефона.
3. Проверьте настройки инстанса: адрес для отправки уведомлений (webhookUrl) должен быть пустым, а получение уведомлений о входящих сообщениях — включено. Иначе ReceiveNotification не вернёт ответы.
4. Скопируйте `idInstance` и `apiTokenInstance`.

## Как пользоваться

1. Введите `idInstance` и `apiTokenInstance`, нажмите «Войти».
2. Введите номер получателя в международном формате, например `79991234567`, и нажмите «+».
3. Напишите сообщение и нажмите Enter или кнопку отправки.
4. Ответ получателя появится в этом же чате.

## Как это устроено

- Адрес API определяется по первым четырём цифрам `idInstance`: `4100123456` → `https://4100.api.green-api.com`.
- Входящие сообщения Telegram приходят с числовым `chatId`, поэтому при создании чата номер телефона сначала переводится в `chatId` через CheckAccount — так ответ попадает в тот же чат.
- Уведомления забираются по одному: ReceiveNotification ждёт новое уведомление до 20 секунд (long polling), после обработки оно удаляется из очереди через DeleteNotification. Повторно доставленные сообщения отбрасываются по `idMessage`.
- Если написал собеседник, которого нет в списке, чат с ним создаётся автоматически.

```
src/
├── api/greenApi.ts            — запросы к GREEN-API
├── hooks/useNotifications.ts  — цикл ReceiveNotification → DeleteNotification
├── components/
│   ├── Login/                 — форма входа
│   ├── Messenger/             — список чатов и создание чата по номеру
│   ├── ChatWindow/            — переписка и поле ввода
│   └── Avatar/                — аватар с инициалом
├── types.ts
├── utils.ts
└── index.css                  — цвета Telegram и фон переписки
```

## Технологии

React 19, TypeScript, Vite, CSS Modules. Других зависимостей нет.
