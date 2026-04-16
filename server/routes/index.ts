import { FastifyInstance } from 'fastify';
import dictionaryRoutes from './dictionary.routes';
import { IDictionary, IWord } from '../types/dictionaryTypes';
import { Low } from 'lowdb';

export default async function registerRoutes(
  fastify: FastifyInstance,
  db: Low<IDictionary>,
) {
  await fastify.register(dictionaryRoutes, { prefix: 'api/', db });
}
