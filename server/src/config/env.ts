import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(16),

  DEV_FAKE_AUTH: z
    .string()
    .optional()
    .transform((v) => v === 'true'),

  OIDC_ISSUER_URL: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  OIDC_REDIRECT_URI: z.string().optional(),
  OIDC_SCOPES: z.string().default('openid profile email'),

  GGDEALS_API_KEY: z.string().min(1),
  GGDEALS_DEFAULT_REGION: z.string().default('us'),

  IGDB_CLIENT_ID: z.string().min(1),
  IGDB_CLIENT_SECRET: z.string().min(1),

  // Comma-separated emails granted administrator access on login.
  ADMIN_EMAILS: z.string().optional().default(''),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment configuration:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  if (!parsed.data.DEV_FAKE_AUTH) {
    const missingOidc = ['OIDC_ISSUER_URL', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_REDIRECT_URI'].filter(
      (key) => !parsed.data[key as keyof Env],
    );
    if (missingOidc.length > 0) {
      console.error(
        `Missing OIDC configuration (${missingOidc.join(', ')}). Set DEV_FAKE_AUTH=true for local dev without an OIDC provider.`,
      );
      process.exit(1);
    }
  }

  return parsed.data;
}

export const env = loadEnv();
