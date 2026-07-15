import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In the production image this file runs from dist/plugins/static.js; web/dist is copied alongside dist/.
const webDistPath = path.resolve(__dirname, '../../web-dist');

export default fp(async function staticPlugin(app: FastifyInstance) {
  await app.register(fastifyStatic, { root: webDistPath, wildcard: false });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api') || request.url.startsWith('/auth')) {
      reply.status(404).send({ error: 'Not found' });
      return;
    }
    reply.sendFile('index.html');
  });
});
