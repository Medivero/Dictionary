import {
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Low } from 'lowdb';
import { IDictionary, IUserDb } from '../types/dictionaryTypes';

type AuthUser = { id: string; username: string };
type TokenPayload = { sub: string; username: string; iat: number; exp: number };

const PASSWORD_KEYLEN = 64;

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? 'dev-secret-change-me';
}

function getTokenTtlMs() {
  const days = Number(process.env.AUTH_TOKEN_TTL_DAYS ?? '30');
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
  return safeDays * 24 * 60 * 60 * 1000;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlDecodeToString(input: string) {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replaceAll('-', '+').replaceAll('_', '/') + pad;
  return Buffer.from(b64, 'base64').toString('utf8');
}

function sign(data: string) {
  const mac = createHmac('sha256', getAuthSecret()).update(data).digest();
  return base64UrlEncode(mac);
}

function createToken(payload: TokenPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expectedSig = sign(body);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(body)) as TokenPayload;
  } catch {
    return null;
  }

  if (
    !payload ||
    typeof payload.sub !== 'string' ||
    typeof payload.username !== 'string' ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }

  if (payload.exp <= Date.now()) return null;
  return payload;
}

function extractBearerToken(request: FastifyRequest) {
  const header = request.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, PASSWORD_KEYLEN);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

function verifyPassword(password: string, stored: string) {
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(keyHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function findUserById(users: IUserDb[], id: string) {
  return users.find((u) => u.id === id) ?? null;
}

function findUserByUsername(users: IUserDb[], username: string) {
  return users.find((u) => u.username === username) ?? null;
}

export function registerAuth(fastify: FastifyInstance, db: Low<IDictionary>) {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const token = extractBearerToken(request);
      if (!token) {
        reply.code(401).send({ message: 'Missing bearer token' });
        return;
      }

      const payload = verifyToken(token);
      if (!payload) {
        reply.code(401).send({ message: 'Invalid token' });
        return;
      }

      const user = findUserById(db.data.users, payload.sub);
      if (!user) {
        reply.code(401).send({ message: 'Invalid token' });
        return;
      }

      if (payload.username !== user.username) {
        reply.code(401).send({ message: 'Invalid token' });
        return;
      }

      request.user = { id: user.id, username: user.username };
      request.authToken = token;
    },
  );

  fastify.post<{
    Body: { username: string; password: string };
    Reply: { token: string; user: AuthUser } | { message: string };
  }>('/auth/register', async (request, reply) => {
    const username = normalizeUsername(request.body?.username ?? '');
    const password = request.body?.password ?? '';

    if (username.length < 3 || username.length > 32) {
      reply.code(400).send({ message: 'Username must be 3..32 chars' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      reply.code(400).send({ message: 'Password must be 8..128 chars' });
      return;
    }

    if (findUserByUsername(db.data.users, username)) {
      reply.code(409).send({ message: 'User already exists' });
      return;
    }

    const now = Date.now();
    const user: IUserDb = {
      id: randomUUID(),
      username,
      password: hashPassword(password),
      created_at: now,
      updated_at: now,
      user_dictionary: [],
      user_activity_dates: [],
    };
    db.data.users.push(user);
    await db.write();

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      iat: now,
      exp: now + getTokenTtlMs(),
    };
    const token = createToken(payload);
    reply.send({ token, user: { id: user.id, username: user.username } });
  });

  fastify.post<{
    Body: { username: string; password: string };
    Reply: { token: string; user: AuthUser } | { message: string };
  }>('/auth/login', async (request, reply) => {
    const username = normalizeUsername(request.body?.username ?? '');
    const password = request.body?.password ?? '';

    const user = findUserByUsername(db.data.users, username);
    if (!user || !verifyPassword(password, user.password)) {
      reply.code(401).send({ message: 'Invalid username or password' });
      return;
    }

    const now = Date.now();
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      iat: now,
      exp: now + getTokenTtlMs(),
    };
    const token = createToken(payload);
    reply.send({ token, user: { id: user.id, username: user.username } });
  });

  fastify.get(
    '/auth/me',
    { preHandler: fastify.authenticate },
    async (request) => {
      return { user: request.user };
    },
  );

  fastify.post(
    '/auth/logout',
    { preHandler: fastify.authenticate },
    async (_request, reply) => {
      reply.send({ success: true });
    },
  );
}
