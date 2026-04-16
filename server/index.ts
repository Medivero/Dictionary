import Fastify from 'fastify';
import registerRoutes from './routes';
import cors from '@fastify/cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { IDictionary } from './types/dictionaryTypes';

const fastify = Fastify({ logger: true });
const adapter = new JSONFile<IDictionary>('server/db.json');
const db = new Low(adapter, {
  dictionary: [],
});

await db.read();

await fastify.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
});

const start = async () => {
  try {
    await registerRoutes(fastify, db);
    await fastify.listen({ port: 5563 });
    console.log('Fastify running on port 5563');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
