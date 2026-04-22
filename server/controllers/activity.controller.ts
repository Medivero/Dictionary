import { FastifyReply, FastifyRequest } from 'fastify';
import { Low } from 'lowdb';
import { IDictionary } from '../types/dictionaryTypes';

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

export const getUserActivity = async (
  req: FastifyRequest,
  reply: FastifyReply,
  db: Low<IDictionary>,
) => {
  const user = requireUser(req, reply, db);
  if (!user) return;
  return reply.send({ user_activity_dates: user.user_activity_dates ?? [] });
};

