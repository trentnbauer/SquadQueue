import { apiGet, apiDelete } from './client';
import type { AdminIntegrationStatus, AdminRoomSummary, AdminUserSummary } from '@squadqueue/shared';

export const adminApi = {
  overview: () => apiGet<{ status: AdminIntegrationStatus }>('/api/admin/overview'),
  users: () => apiGet<{ users: AdminUserSummary[] }>('/api/admin/users'),
  deleteUser: (id: string) => apiDelete(`/api/admin/users/${id}`),
  rooms: () => apiGet<{ rooms: AdminRoomSummary[] }>('/api/admin/rooms'),
  deleteRoom: (id: string) => apiDelete(`/api/admin/rooms/${id}`),
};
