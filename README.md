# Telegram-чат на GREEN-API

Тестовое задание на должность «Фронтенд-разработчик React»: веб-интерфейс для отправки и получения текстовых сообщений в Telegram через [GREEN-API](https://green-api.com/telegram/). Внешний вид — по мотивам Telegram Web.


## Локальный запуск

```bash
git clone https://github.com/MuslimEvloev/telegram-chat-green-api.git
cd telegram-chat-green-api
npm install
npm run dev
```


Vercel: https://telegram-chat-green-api.vercel.app/

## Подготовка инстанса GREEN-API

1. Зарегистрируйтесь в [личном кабинете](https://console.green-api.com) и создайте инстанс Telegram (тариф «Разработчик» бесплатный).
2. Авторизуйте инстанс: войдите в свой аккаунт Telegram по QR-коду или номеру телефона.
3. Включите получение входящих: «Изменить» → «Получать уведомления о входящих сообщениях и файлах», поле webhookUrl оставьте пустым.
4. Скопируйте `idInstance` и `apiTokenInstance`.


## Как пользоваться

1. Введите `idInstance` и `apiTokenInstance`, нажмите «Войти».
2. Введите номер.
3. Напишите сообщение и нажмите Enter или кнопку отправки.
4. Ответ получателя появится в этом же чате.


## Технологии

React 19, TypeScript, Vite, CSS Modules.
