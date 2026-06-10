import { createClient } from '@libsql/client';

export const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
  authToken: process.env.DATABASE_AUTH_TOKEN, // Автоматическая поддержка безопасных соединений в облаке
});