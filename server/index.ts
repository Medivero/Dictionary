import Fastify from 'fastify';
import registerRoutes from './routes';
import cors from '@fastify/cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { IDictionary } from './types/dictionaryTypes';
import { randomUUID } from 'crypto';

const fastify = Fastify({ logger: true });
const adapter = new JSONFile<IDictionary>('server/db.json');
const db = new Low(adapter, {
  users: [],
});

await db.read();
db.data ||= {
  users: [],
};

{
  const raw = db.data as unknown as Record<string, any>;
  const legacyDictionary: any[] = Array.isArray(raw.dictionary)
    ? raw.dictionary
    : [];
  const usersArray: any[] | null = Array.isArray(raw.users) ? raw.users : null;
  const usersObject: any =
    raw?.users && !Array.isArray(raw.users) ? raw.users : null;

  const migratedUsers: any[] = [];

  if (usersArray) {
    migratedUsers.push(...usersArray);
  } else if (usersObject && Object.keys(usersObject).length > 0) {
    migratedUsers.push(usersObject);
  } else if (legacyDictionary.length > 0) {
    const now = Date.now();
    migratedUsers.push({
      id: randomUUID(),
      username: 'legacy',
      password: '',
      created_at: now,
      updated_at: now,
      user_dictionary: legacyDictionary.map((w) => ({
        word: String(w?.name ?? ''),
        translate: String(w?.translate ?? ''),
        created_at: Number(w?.id ?? Date.now()),
        updated_at: Number(w?.id ?? Date.now()),
      })),
      user_activity_dates: [],
    });
  }

  const normalizedUsers = migratedUsers
    .filter((u) => u && typeof u === 'object')
    .map((u) => ({
      id: String(u.id ?? randomUUID()),
      username: String(u.username ?? ''),
      password: String(u.password ?? u.passwordHash ?? ''),
      created_at: Number(u.created_at ?? u.createdAt ?? 0),
      updated_at: Number(u.updated_at ?? u.updatedAt ?? 0),
      user_dictionary: Array.isArray(u.user_dictionary)
        ? u.user_dictionary
        : [],
      user_activity_dates: Array.isArray(u.user_activity_dates)
        ? u.user_activity_dates
        : [],
    }));

  db.data = { users: normalizedUsers };
  await db.write();
}

await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

const start = async () => {
  try {
    await registerRoutes(fastify, db);
    await fastify.listen({ host: '192.168.3.35', port: 5563 });
    console.log('Fastify running on port 5563');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
