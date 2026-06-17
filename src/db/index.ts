import { createClient } from '@libsql/client';

const createDbClient = () => {
  return createClient({
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
};

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createDbClient> | undefined;
};

export const client = globalForDb.client ?? createDbClient();

if (process.env.NODE_ENV !== 'production') globalForDb.client = client;