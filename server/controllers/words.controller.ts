import { FastifyReply, FastifyRequest } from 'fastify';
import { makeTranslateRequest } from '../services/makeTranslateRequest';
import { IWord } from '../types/dictionaryTypes';

export const translateWord = async (
  req: FastifyRequest<{ Params: { text: string } }>,
  reply: FastifyReply,
) => {
  const resp = await makeTranslateRequest(req.params.text);
  return reply.send(resp);
};
