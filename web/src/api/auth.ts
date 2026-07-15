import { apiGet } from './client';
import type { User } from '@squadqueue/shared';

export const authApi = {
  me: () => apiGet<{ user: User | null }>('/api/me'),
  loginUrl: '/auth/login',
  logoutUrl: '/auth/logout',
};
