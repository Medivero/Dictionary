import { FastifyReply, FastifyRequest } from 'fastify';
import { IDictionary, IWord } from '../types/dictionaryTypes';
import { Low } from 'lowdb';

function requireUser(
  req: FastifyRequest,
  reply: FastifyReply,
  db: Low<IDictionary>,
) {
  const userId = req.user?.id;
  if (!userId) {
    reply.code(401).send({ message: 'Unauthorized' });
    return null;
  }
  const user = db.data.users.find((u) => u.id === userId) ?? null;
  if (!user) {
    reply.code(401).send({ message: 'Unauthorized' });
    return null;
  }
  return user;
}

function toApiWord(entry: {
  word: string;
  translate: string;
  created_at: number;
}) {
  return {
    id: entry.created_at,
    name: entry.word,
    translate: entry.translate,
  };
}

export const addWord = async (
  req: FastifyRequest<{ Body: IWord }>,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  const user = requireUser(req, reply, db);
  if (!user) return;
  const newWord = req.body;
  const now = Date.now();
  newWord.id = now;
  try {
    user.user_dictionary.unshift({
      word: newWord.name,
      translate: newWord.translate,
      created_at: now,
      updated_at: now,
    });
    user.updated_at = now;
    user.user_activity_dates.unshift({
      date: now,
      updated_word: newWord.name,
    });
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
    const user = requireUser(req, reply, db);
    if (!user) return;
    const dictionary = user.user_dictionary.map(toApiWord);
    reply.send({ dictionary });
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
    const user = requireUser(req, reply, db);
    if (!user) return;
    const id = Number(req.params.id);
    const before = user.user_dictionary;
    const removed = before.find((w) => w.created_at === id);
    user.user_dictionary = before.filter((w) => w.created_at !== id);
    const now = Date.now();
    user.updated_at = now;
    if (removed) {
      user.user_activity_dates.unshift({
        date: now,
        updated_word: removed.word,
      });
    }
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
    const user = requireUser(req, reply, db);
    if (!user) return;
    const now = Date.now();
    user.user_dictionary = user.user_dictionary.map((entry) => {
        if (entry.created_at === newWord.id) {
          return {
            ...entry,
            word: newWord.name,
            translate: newWord.translate,
            updated_at: now,
          };
        }
        return entry;
      },
    );
    user.updated_at = now;
    user.user_activity_dates.unshift({
      date: now,
      updated_word: newWord.name,
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
  const user = requireUser(req, reply, db);
  if (!user) return;
  const str = req.params.substring.toLowerCase();
  let tempDictionary = [...user.user_dictionary];
  if (!str) {
    return reply.send(tempDictionary.map(toApiWord));
  }
  tempDictionary = tempDictionary.filter(
    (word) =>
      word.word.toLowerCase().includes(str) ||
      word.translate.toLowerCase().includes(str),
  );
  return reply.send(tempDictionary.map(toApiWord));
};
