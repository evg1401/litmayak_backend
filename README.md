## Структура проекта

```
configs/                    конфигурация приложения
dto/                        общие DTO
envs/                       файлы окружения (.env)
libs/
  common/                   общие утилиты вне контекста модулей nest
  models/                   модели Sequelize
  interfaces/               общие ts-интерфейсы
src/
  ability/                  построение CASL-ability из прав роли пользователя
  auth/                     аутентификация
  books/                    публичный каталог книг
  common/
    constants/              общие enum/константы проекта
  decorators/                кастомные декораторы
  genres/                   жанры книг
  guards/                   
  helpers/                  вспомогательные функции
  logger/                   логирование
  middlewares/              
  notifications/            уведомления
  profile/                  личный кабинет
    authors/                профиль автора
    book_characters/        главы
    book_collections/       подборки
    book_reviews/           отзывы
    books/                  книги пользователя (создание/редактирование, избранное)
    user_favorites/         избранное
    users/                  профиль
  publishing_houses/        издательства
  roles/                    роли и права доступа
  schedulers/               
  app.module.ts             
```

## Запуск

`npm run start:dev` — запуск в режиме разработки.
`npm run build` — сборка.
