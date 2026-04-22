import { FastifyInstance } from 'fastify';
import {
  addWord,
  deleteWord,
  editWord,
  getDictionary,
  searchWord,
} from '../controllers/dictionary.controller';
import { Low } from 'lowdb';
import { IDictionary, IWord } from '../types/dictionaryTypes';
import { translateWord } from '../controllers/words.controller';
import { getUserActivity } from '../controllers/activity.controller';

export default async function dictionaryRoutes(
  fastify: FastifyInstance,
  opts: { db: Low<IDictionary> },
) {
  const db = opts.db;

  fastify.get(
    '/dictionary',
    { preHandler: fastify.authenticate },
    (req, rep) => getDictionary(req, rep, db),
  );

  fastify.post<{ Body: IWord }>(
    '/dictionary/add',
    { preHandler: fastify.authenticate },
    (req, rep) => addWord(req, rep, db),
  );

  fastify.delete<{ Params: { id: string } }>(
    '/dictionary/:id',
    { preHandler: fastify.authenticate },
    (req, rep) => deleteWord(req, rep, db),
  );

  fastify.patch<{ Body: IWord }>(
    '/dictionary',
    { preHandler: fastify.authenticate },
    (req, rep) => editWord(req, rep, db),
  );

  fastify.get<{ Params: { substring: string } }>(
    '/dictionary/:substring',
    { preHandler: fastify.authenticate },
    (req, rep) => searchWord(req, rep, db),
  );

  fastify.get<{ Params: { text: string } }>(
    '/word/translate/:text',
    (req, rep) => translateWord(req, rep),
  );

  fastify.get(
    '/activity',
    { preHandler: fastify.authenticate },
    (req, rep) => getUserActivity(req, rep, db),
  );
}
