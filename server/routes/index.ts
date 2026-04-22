import { FastifyInstance } from 'fastify';
import dictionaryRoutes from './dictionary.routes';
import { IDictionary } from '../types/dictionaryTypes';
import { Low } from 'lowdb';
import { registerAuth } from '../services/auth';

export default async function registerRoutes(
  fastify: FastifyInstance,
  db: Low<IDictionary>,
) {
  await fastify.register(
    async (api) => {
      registerAuth(api, db);
      await api.register(dictionaryRoutes, { db });
    },
    { prefix: 'api/' },
  );
}
