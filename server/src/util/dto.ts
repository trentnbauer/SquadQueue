import type { User } from '@squadqueue/shared';

export function toUserDto(user: { id: string; displayName: string; avatarColor: string }): User {
  return { id: user.id, displayName: user.displayName, avatarColor: user.avatarColor };
}
