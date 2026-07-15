import type { User } from '@squadqueue/shared';

export function toUserDto(user: {
  id: string;
  displayName: string;
  avatarColor: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}): User {
  return {
    id: user.id,
    displayName: user.displayName,
    avatarColor: user.avatarColor,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
  };
}
