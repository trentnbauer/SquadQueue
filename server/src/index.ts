import { buildApp } from './app.js';
import { env } from './config/env.js';

const app = await buildApp();

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => app.log.info(`SquadQueue server listening on port ${env.PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
