import { FastifyReply, FastifyRequest } from 'fastify';
import { IDictionary, IWord } from '../types/dictionaryTypes';
import { Low } from 'lowdb';

export const addWord = async (
  req: FastifyRequest<{ Body: IWord }>,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  const newWord = req.body;
  newWord.id = Date.now();
  try {
    db.data.dictionary.unshift(newWord);
    await db.write();
    return reply.send(newWord);
  } catch (err) {
    return reply.send({ success: false, err });
  }
};

export const getDictionary = async (
  req: FastifyRequest,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  try {
    reply.send(db.data);
  } catch (err) {
    return reply.send({ success: false, err });
  }
};

export const deleteWord = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  try {
    const id = Number(req.params.id);
    db.data.dictionary = db.data.dictionary.filter((word) => word.id !== id);
    await db.write();
    return reply.send(id);
  } catch (error) {
    return reply.send(error);
  }
};

export const editWord = async (
  req: FastifyRequest<{ Body: IWord }>,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  const newWord: IWord = req.body;
  try {
    db.data.dictionary = db.data.dictionary.map((word) => {
      if (word.id === newWord.id) {
        return newWord;
      }
      return word;
    });
    await db.write();
    return reply.send(newWord);
  } catch (err) {
    return reply.send({ success: false, err });
  }
};

export const searchWord = async (
  req: FastifyRequest<{ Params: { substring: string } }>,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  const str = req.params.substring.toLowerCase();
  let tempDictionary = [...db.data.dictionary];
  if (!str) {
    return tempDictionary;
  }
  tempDictionary = tempDictionary.filter(
    (word) =>
      word.name.toLowerCase().includes(str) ||
      word.translate.toLowerCase().includes(str),
  );
  return reply.send(tempDictionary);
};
