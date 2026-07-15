import type { FastifyInstance } from 'fastify';
import * as client from 'openid-client';
import { env } from '../config/env.js';
import { prisma } from '../db/client.js';
import { getOrCreateUser } from '../plugins/auth.js';
import { toUserDto } from '../util/dto.js';

export default async function authRoutes(app: FastifyInstance) {
  app.get('/auth/login', async (request, reply) => {
    if (env.DEV_FAKE_AUTH) {
      return reply.redirect(env.APP_BASE_URL);
    }

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    request.session.oidcCodeVerifier = codeVerifier;
    request.session.oidcState = state;

    const authUrl = client.buildAuthorizationUrl(app.oidcConfig!, {
      redirect_uri: env.OIDC_REDIRECT_URI!,
      scope: env.OIDC_SCOPES,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    return reply.redirect(authUrl.href);
  });

  app.get('/auth/callback', async (request, reply) => {
    if (env.DEV_FAKE_AUTH) {
      return reply.redirect(env.APP_BASE_URL);
    }

    const callbackUrl = new URL(env.OIDC_REDIRECT_URI!);
    callbackUrl.search = request.url.split('?')[1] ?? '';

    const tokens = await client.authorizationCodeGrant(app.oidcConfig!, callbackUrl, {
      pkceCodeVerifier: request.session.oidcCodeVerifier,
      expectedState: request.session.oidcState,
    });

    const claims = tokens.claims();
    if (!claims?.sub) {
      return reply.status(400).send({ error: 'OIDC provider did not return a subject claim' });
    }

    let email = typeof claims.email === 'string' ? claims.email : null;
    let name = typeof claims.name === 'string' ? claims.name : null;
    let picture = typeof claims.picture === 'string' ? claims.picture : null;
    if (!email || !name || !picture) {
      const userInfo = await client.fetchUserInfo(app.oidcConfig!, tokens.access_token, claims.sub);
      email = email ?? (typeof userInfo.email === 'string' ? userInfo.email : `${claims.sub}@unknown`);
      name = name ?? (typeof userInfo.name === 'string' ? userInfo.name : claims.sub);
      picture = picture ?? (typeof userInfo.picture === 'string' ? userInfo.picture : null);
    }

    const user = await getOrCreateUser({ oidcSub: claims.sub, email, displayName: name, avatarUrl: picture });

    request.session.userId = user.id;
    delete request.session.oidcCodeVerifier;
    delete request.session.oidcState;

    return reply.redirect(env.APP_BASE_URL);
  });

  app.get('/auth/logout', async (request, reply) => {
    await request.session.destroy();
    return reply.redirect(env.APP_BASE_URL);
  });

  app.get('/api/me', async (request, reply) => {
    const userId = await request.currentUserId();
    if (!userId) return reply.send({ user: null });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.send({ user: null });

    return reply.send({ user: toUserDto(user) });
  });
}
