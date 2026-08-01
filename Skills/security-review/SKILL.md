---
name: security-review
description: Используйте этот skill при добавлении аутентификации, обработке пользовательского ввода, работе с секретами, создании API endpoints или реализации платёжных/чувствительных функций. Предоставляет исчерпывающий чек-лист безопасности и паттерны.
metadata:
  origin: ECC
---

> Источник: https://github.com/affaan-m/ECC (MIT). Адаптировано для TT3Dato.

# Security Review Skill

Этот skill гарантирует, что весь код следует лучшим практикам безопасности и выявляет потенциальные уязвимости.

## Когда активировать

- Реализация аутентификации или авторизации
- Обработка пользовательского ввода или загрузки файлов
- Создание новых API endpoints
- Работа с секретами или учётными данными
- Реализация платёжных функций
- Хранение или передача чувствительных данных
- Интеграция сторонних API

## Чек-лист безопасности

### 1. Управление секретами

#### НЕВЕРНО: Никогда так не делайте
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

#### ВЕРНО: Всегда делайте так
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// Verify secrets exist
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### Шаги проверки
- [ ] Нет хардкоженных API-ключей, токенов или паролей
- [ ] Все секреты в переменных окружения
- [ ] `.env.local` в .gitignore
- [ ] Нет секретов в истории git
- [ ] Продакшен-секреты в хостинг-платформе (Vercel, Railway)

### 2. Валидация ввода

#### Всегда валидируйте пользовательский ввод
```typescript
import { z } from 'zod'

// Define validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// Validate before processing
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues }
    }
    throw error
  }
}
```

#### Валидация загрузки файлов
```typescript
function validateFileUpload(file: File) {
  // Size check (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // Type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### Шаги проверки
- [ ] Весь пользовательский ввод валидирован схемами
- [ ] Загрузка файлов ограничена (размер, тип, расширение)
- [ ] Нет прямого использования пользовательского ввода в запросах
- [ ] Валидация по whitelist'у (не blacklist'у)
- [ ] Сообщения об ошибках не раскрывают чувствительную информацию

### 3. Предотвращение SQL-инъекций

#### НЕВЕРНО: Никогда не конкатенируйте SQL
```typescript
// DANGEROUS - SQL Injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ВЕРНО: Всегда используйте параметризованные запросы
```typescript
// Safe - parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// Or with raw SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### Шаги проверки
- [ ] Все запросы к базе данных используют параметризованные запросы
- [ ] Нет конкатенации строк в SQL
- [ ] ORM/query builder используется корректно
- [ ] Supabase-запросы должным образом очищены

### 4. Аутентификация и авторизация

#### Обработка JWT-токенов
```typescript
// НЕВЕРНО: localStorage (уязвим к XSS)
localStorage.setItem('token', token)

// ВЕРНО: httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### Проверки авторизации
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // ALWAYS verify authorization first
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Proceed with deletion
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security (Supabase)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### Шаги проверки
- [ ] Токены хранятся в httpOnly cookies (не в localStorage)
- [ ] Проверки авторизации перед чувствительными операциями
- [ ] Row Level Security включён в Supabase
- [ ] Реализован контроль доступа на основе ролей
- [ ] Управление сессиями безопасно

### 5. Предотвращение XSS

#### Очистка HTML
```typescript
import DOMPurify from 'isomorphic-dompurify'

// ALWAYS sanitize user-provided HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy

Начинайте со строгой политики и ослабляйте её только по задокументированному плану удаления. Не используйте по умолчанию
`'unsafe-inline'` или `'unsafe-eval'`; они нейтрализуют большую часть защиты CSP
и должны рассматриваться как временный компромисс совместимости.

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      base-uri 'self';
      object-src 'none';
      frame-ancestors 'none';
      script-src 'self';
      style-src 'self';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### Шаги проверки
- [ ] Пользовательский HTML очищен
- [ ] CSP headers настроены
- [ ] Нет отрисовки непроверенного динамического контента
- [ ] Использована встроенная защита от XSS в React

### 6. Защита от CSRF

#### CSRF-токены
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // Process request
}
```

#### SameSite Cookies
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### Шаги проверки
- [ ] CSRF-токены на операциях, изменяющих состояние
- [ ] SameSite=Strict на всех cookies
- [ ] Реализован паттерн double-submit cookie

### 7. Rate Limiting

#### Rate Limiting API
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
})

// Apply to routes
app.use('/api/', limiter)
```

#### Дорогие операции
```typescript
// Aggressive rate limiting for searches
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### Шаги проверки
- [ ] Rate limiting на всех API endpoints
- [ ] Более строгие лимиты на дорогие операции
- [ ] Rate limiting на основе IP
- [ ] Rate limiting на основе пользователя (аутентифицированного)

### 8. Раскрытие чувствительных данных

#### Логирование
```typescript
// НЕВЕРНО: логирование чувствительных данных
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ВЕРНО: редактирование чувствительных данных
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### Сообщения об ошибках
```typescript
// НЕВЕРНО: раскрытие внутренних деталей
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ВЕРНО: общие сообщения об ошибках
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### Шаги проверки
- [ ] Нет паролей, токенов или секретов в логах
- [ ] Сообщения об ошибках общие для пользователей
- [ ] Детальные ошибки только в серверных логах
- [ ] Нет stack traces, раскрываемых пользователям

### 9. Безопасность блокчейна (Solana)

#### Проверка кошелька
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### Проверка транзакции
```typescript
async function verifyTransaction(transaction: Transaction) {
  // Verify recipient
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // Verify amount
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // Verify user has sufficient balance
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### Шаги проверки
- [ ] Подписи кошельков проверены
- [ ] Детали транзакций валидированы
- [ ] Проверки баланса перед транзакциями
- [ ] Нет слепого подписания транзакций

### 10. Безопасность зависимостей

#### Регулярные обновления
```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

#### Lock Files
```bash
# ALWAYS commit lock files
git add package-lock.json

# Use in CI/CD for reproducible builds
npm ci  # Instead of npm install
```

#### Шаги проверки
- [ ] Зависимости актуальны
- [ ] Нет известных уязвимостей (npm audit clean)
- [ ] Lock files закоммичены
- [ ] Dependabot включён на GitHub
- [ ] Регулярные обновления безопасности

## Тестирование безопасности

### Автоматизированные тесты безопасности
```typescript
// Test authentication
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// Test authorization
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// Test input validation
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// Test rate limiting
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## Pre-Deployment Security Checklist

Перед ЛЮБЫМ продакшен-деплоем:

- [ ] **Секреты**: Нет хардкоженных секретов, все в env vars
- [ ] **Валидация ввода**: Весь пользовательский ввод валидирован
- [ ] **SQL Injection**: Все запросы параметризованы
- [ ] **XSS**: Пользовательский контент очищен
- [ ] **CSRF**: Защита включена
- [ ] **Аутентификация**: Правильная обработка токенов
- [ ] **Авторизация**: Проверки ролей на месте
- [ ] **Rate Limiting**: Включён на всех endpoints
- [ ] **HTTPS**: Принудительно в продакшене
- [ ] **Security Headers**: CSP, X-Frame-Options настроены
- [ ] **Обработка ошибок**: Нет чувствительных данных в ошибках
- [ ] **Логирование**: Нет чувствительных данных в логах
- [ ] **Зависимости**: Актуальны, нет уязвимостей
- [ ] **Row Level Security**: Включён в Supabase
- [ ] **CORS**: Настроен корректно
- [ ] **Загрузка файлов**: Валидирована (размер, тип)
- [ ] **Подписи кошельков**: Проверены (если блокчейн)

## Ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**Запомните (Remember)**: Безопасность не опциональна. Одна уязвимость может скомпрометировать всю платформу. При сомнении предпочитайте сторону осторожности.
