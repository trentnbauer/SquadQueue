import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import * as client from 'openid-client';
import { env } from '../config/env.js';
import { prisma } from '../db/client.js';
import { HttpError } from '../util/httpError.js';

const DEV_USER = {
  oidcSub: 'dev-user',
  email: 'dev@localhost',
  displayName: 'Dev User',
  avatarColor: '#8b5cf6',
  avatarUrl: null,
};

declare module 'fastify' {
  interface FastifyInstance {
    oidcConfig: client.Configuration | null;
  }
  interface FastifyRequest {
    currentUserId: () => Promise<string | null>;
    requireAuth: () => Promise<string>;
  }
}

async function getOrCreateUser(profile: {
  oidcSub: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  return prisma.user.upsert({
    where: { oidcSub: profile.oidcSub },
    update: { email: profile.email, displayName: profile.displayName, avatarUrl: profile.avatarUrl },
    create: { ...profile, avatarColor: randomAvatarColor() },
  });
}

const AVATAR_COLORS = ['#E8734A', '#4A8FE8', '#6FBF73', '#B87DE8', '#E8C34A', '#4AE8D0'];
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export default fp(async function authPlugin(app: FastifyInstance) {
  let oidcConfig: client.Configuration | null = null;

  if (!env.DEV_FAKE_AUTH) {
    oidcConfig = await client.discovery(
      new URL(env.OIDC_ISSUER_URL!),
      env.OIDC_CLIENT_ID!,
      env.OIDC_CLIENT_SECRET!,
    );
  } else {
    app.log.warn('DEV_FAKE_AUTH is enabled — every request will be authenticated as a hardcoded dev user. Do NOT use this in production.');
  }

  app.decorate('oidcConfig', oidcConfig);

  app.decorateRequest('currentUserId', async function (this: FastifyRequest) {
    if (env.DEV_FAKE_AUTH) {
      const devUser = await getOrCreateUser(DEV_USER);
      return devUser.id;
    }
    return this.session.userId ?? null;
  });

  app.decorateRequest('requireAuth', async function (this: FastifyRequest) {
    const userId = await this.currentUserId();
    if (!userId) {
      throw new HttpError(401, 'Not signed in');
    }
    return userId;
  });

  app.setErrorHandler((error: FastifyError, _request, reply: FastifyReply) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    if (statusCode >= 500) app.log.error(error);
    reply.status(statusCode).send({ error: error.message });
  });
});

export { getOrCreateUser };
