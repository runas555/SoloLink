const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Нативный парсинг и загрузка .env файла
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      // Убираем кавычки, если они есть
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
    }
  });
  console.log('Файл .env успешно загружен для миграции.');
}

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  console.log('Инициализация таблиц базы данных по адресу:', process.env.DATABASE_URL || 'file:local.db');
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        business_name TEXT NOT NULL,
        timezone TEXT NOT NULL DEFAULT 'UTC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Таблица "users" создана.');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('- Таблица "services" создана.');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, day_of_week)
      );
    `);
    console.log('- Таблица "schedules" создана.');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
      );
    `);
    console.log('- Таблица "bookings" создана.');

    console.log('База данных успешно подготовлена к работе.');
  } catch (error) {
    console.error('Ошибка создания таблиц:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();