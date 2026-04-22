# Dictionary

Документация разработчика для приложения словаря на `React + Vite` с BFF на `Fastify`.

## Назначение

Приложение хранит пары `слово -> перевод`, позволяет:

- загружать словарь при старте;
- добавлять новое слово;
- редактировать существующее слово;
- удалять слово;
- искать по слову и переводу;
- автоматически запрашивать перевод нового английского слова через внешний API.

## Стек

### Клиент

- `React 19`
- `TypeScript`
- `Vite`
- `Redux Toolkit`
- `MUI`
- `Formik`
- `Yup`

### Сервер

- `Fastify`
- `TypeScript`
- `axios`

## Архитектура

Проект разделен на две части:

- клиент в каталоге `src/`;
- сервер в каталоге `server/`.

Клиент работает как SPA и общается с BFF по HTTP. Сервер хранит данные в локальном JSON-файле `server/db.json`.

### Поток данных

1. При старте `src/App.tsx` диспатчит `fetchDictionary`.
2. `src/features/dictionary/dictionarySlicer.ts` вызывает клиентскую API-обертку.
3. Клиентская API-обертка обращается к BFF.
4. BFF читает/изменяет `lowdb` и возвращает результат.
5. Redux обновляет состояние, после чего React перерисовывает таблицу.

## Структура проекта

```text
.
├── server
│   ├── app.ts                     # запуск Fastify, CORS, инициализация lowdb
│   ├── index.ts                   # точка входа сервера
│   ├── routes
│   │   ├── index.ts               # регистрация роутов
│   │   └── dictionary.routes.ts   # API словаря и перевода
│   ├── controllers
│   │   ├── dictionary.controller.ts
│   │   └── words.controller.ts
│   ├── services
│   │   └── makeTranslateRequest.ts
│   ├── constants
│   │   └── apis.ts
│   ├── types
│   │   └── dictionaryTypes.ts
│   └── db.json                    # локальное хранилище словаря
├── src
│   ├── app
│   │   └── store.ts               # конфигурация Redux store
│   ├── api
│   │   └── dictionary             # HTTP-запросы к BFF
│   ├── components
│   │   ├── Header
│   │   ├── SearchComponent
│   │   └── Table
│   ├── features
│   │   ├── dictionary
│   │   └── notifications
│   ├── pages
│   │   └── Main
│   ├── constants
│   │   └── config.ts              # чтение Vite env-переменных
│   └── main.tsx                   # точка входа клиента
├── .env
├── package.json
└── vite.config.ts
```

## Локальный запуск

### Требования

- `Node.js` 20+ рекомендуется;
- `npm`.

### Установка

```bash
npm install
```

### Переменные окружения

Файл `.env` уже ожидается клиентом. Используется переменная:

```env
VITE_REACT_API_URL=http://localhost:5563/
```

Важно:

- префикс `VITE_` обязателен, иначе переменная не будет доступна в клиенте;
- значение должно заканчиваться `/`, потому что далее в коде к нему конкатенируются пути вида `api/dictionary`.

### Команды

- `npm run dev:client` - запускает Vite dev server на `http://localhost:5173`
- `npm run dev:server` - запускает Fastify server на `http://localhost:5563`
- `npm run dev` - поднимает клиент и сервер параллельно
- `npm run build` - собирает клиентское приложение
- `npm run lint` - запускает ESLint
- `npm run preview` - локальный просмотр production-сборки клиента

### Последовательность запуска

Стандартный сценарий:

```bash
npm install
npm run dev
```

После запуска:

- клиент доступен на `http://localhost:5173`;
- BFF доступен на `http://localhost:5563`.

## Клиентская часть

### Точка входа

- `src/main.tsx` создает React root и подключает `Redux Provider`.
- `src/App.tsx` настраивает роутинг и загружает словарь при инициализации.

### Маршруты

Сейчас в приложении один маршрут:

- `/` -> `MainPage`

### Состояние

`Redux store` собирается в `src/app/store.ts` и содержит два slice:

- `dictionary` - данные словаря и флаг загрузки;
- `notifications` - последнее уведомление и история уведомлений.

### Основные UI-компоненты

- `Header` - показывает количество слов и snackbar с уведомлениями;
- `SearchComponent` - отправляет запрос поиска при каждом изменении строки;
- `TableComponent` - рендерит таблицу слов;
- `TableRowComponent` - отвечает за создание, редактирование и удаление записи.

### Особенность добавления слова

В строке создания новой записи `TableRowComponent`:

- пользователь вводит английское слово;
- через `setTimeout` с задержкой 1 секунда вызывается `translateWordBff`;
- перевод автоматически подставляется в поле `translate`;
- поле перевода на форме отключено для ручного редактирования.

## Серверная часть

### Инициализация

`server/app.ts`:

- создает экземпляр `Fastify`;
- подключает `@fastify/cors`;
- инициализирует `lowdb` с файлом `server/db.json`;
- регистрирует маршруты;
- запускает сервер на порту `5563`.

### CORS

Сервер разрешает запросы с:

- `http://localhost:5173`

Если клиент будет запущен на другом origin, конфигурацию CORS нужно расширить.

## HTTP API

Все маршруты регистрируются с префиксом `api/`.

## Авторизация

Все запросы к словарю (`/api/dictionary*`) требуют bearer-токен.

Переменные окружения (необязательно):

- `AUTH_SECRET` — секрет для подписи токенов (по умолчанию используется dev-значение);
- `AUTH_TOKEN_TTL_DAYS` — срок жизни токена в днях (по умолчанию `30`).

Токен нужно передавать в заголовке:

```text
Authorization: Bearer <token>
```

### Зарегистрироваться

`POST /api/auth/register`

Тело:

```json
{ "username": "demo", "password": "password123" }
```

Ответ:

```json
{ "token": "...", "user": { "id": "...", "username": "demo" } }
```

### Войти

`POST /api/auth/login`

Тело:

```json
{ "username": "demo", "password": "password123" }
```

### Текущий пользователь

`GET /api/auth/me` (требует `Authorization`)

### Выйти

`POST /api/auth/logout` (требует `Authorization`)

### Активность пользователя

`GET /api/activity` (требует `Authorization`)

Ответ:

```json
{
  "user_activity_dates": [
    { "date": 1713250000000, "updated_word": "Hello" }
  ]
}
```

### Получить словарь

`GET /api/dictionary`

Требует `Authorization: Bearer <token>`.

Пример ответа:

```json
{
  "dictionary": [
    {
      "id": 1713250000000,
      "name": "Hello",
      "translate": "Привет"
    }
  ]
}
```

### Добавить слово

`POST /api/dictionary/add`

Требует `Authorization: Bearer <token>`.

Тело запроса:

```json
{
  "name": "Hello",
  "translate": "Привет",
  "id": 0
}
```

Примечание: на сервере `id` перезаписывается через `Date.now()`.

### Обновить слово

`PATCH /api/dictionary`

Требует `Authorization: Bearer <token>`.

Тело запроса:

```json
{
  "id": 1713250000000,
  "name": "Hello",
  "translate": "Здравствуйте"
}
```

### Удалить слово

`DELETE /api/dictionary/:id`

Требует `Authorization: Bearer <token>`.

Пример:

```text
DELETE /api/dictionary/1713250000000
```

### Поиск по подстроке

`GET /api/dictionary/:substring`

Требует `Authorization: Bearer <token>`.

Поиск выполняется одновременно по полям `name` и `translate`, без учета регистра.

Пример:

```text
GET /api/dictionary/hel
```

### Получить перевод из внешнего сервиса

`GET /api/word/translate/:text`

Сервер проксирует запрос во внешний сервис:

- `https://lingva.ml/api/v1/`

Текущий маршрут перевода зашит под направление:

- `en -> ru`

## Хранилище данных

Используется `lowdb` поверх JSON-файла `server/db.json`.

Формат данных (словарь хранится внутри пользователя):

```json
{
  "users": [
    {
      "id": "uuid",
      "username": "string",
      "password": "hash",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "user_dictionary": [
        {
          "word": "string",
          "translate": "string",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "user_activity_dates": [
        {
          "date": "timestamp",
          "updated_word": "string"
        }
      ]
    }
  ]
}
```

Особенности:

- база не требует отдельного сервера;
- данные удобны для локальной разработки;
- запись выполняется целиком в JSON-файл.

## Валидация

Для формы строк таблицы используется `Formik` и `Yup`.

Схема валидации находится в:

- `src/components/Table/utils/validationScheme.ts`

Если меняются правила ввода слова или перевода, обновлять нужно именно эту схему.

## Проксирование запросов в dev-режиме

В `vite.config.ts` настроен proxy:

```ts
server: {
  proxy: {
    'api/': 'http://localhost:5563',
  },
}
```

При этом клиентские API-запросы сейчас строятся через `VITE_REACT_API_URL`. Это значит:

- для локальной разработки нужен корректный `.env`;
- Vite proxy в текущей реализации является вспомогательной настройкой и не заменяет env-конфиг полностью.

## Сборка и деплой

Production-сборка выполняется командой:

```bash
npm run build
```

Сейчас команда собирает клиентскую часть через Vite. Серверная часть в отдельный production-бандл не вынесена и запускается как Node/TS приложение в текущем виде.

Перед деплоем стоит отдельно определить:

- как будет запускаться Fastify в production;
- где будет храниться `db.json`;
- какой URL должен использовать клиент вместо локального `localhost`.
