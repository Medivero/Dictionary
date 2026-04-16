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

export default async function dictionaryRoutes(
  fastify: FastifyInstance,
  opts: { db: Low<IDictionary> },
) {
  const db = opts.db;

  fastify.get('/dictionary', (req, rep) => getDictionary(req, rep, db));

  fastify.post<{ Body: IWord }>('/dictionary/add', (req, rep) =>
    addWord(req, rep, db),
  );

  fastify.delete<{ Params: { id: string } }>('/dictionary/:id', (req, rep) =>
    deleteWord(req, rep, db),
  );

  fastify.patch<{ Body: IWord }>('/dictionary', (req, rep) =>
    editWord(req, rep, db),
  );

  fastify.get<{ Params: { substring: string } }>(
    '/dictionary/:substring',
    (req, rep) => searchWord(req, rep, db),
  );

  fastify.get<{ Params: { text: string } }>(
    '/word/translate/:text',
    (req, rep) => translateWord(req, rep),
  );
}
