import { prisma } from '../db/client.js';
import { HttpError } from '../util/httpError.js';

export async function requireMembership(roomId: string, userId: string) {
  const membership = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  if (!membership) {
    throw new HttpError(403, 'You are not a member of this room');
  }
  return membership;
}

export async function requireElevated(roomId: string, userId: string) {
  const membership = await requireMembership(roomId, userId);
  if (membership.role !== 'room_master' && membership.role !== 'moderator') {
    throw new HttpError(403, 'Only the Room Master or a Moderator can do this');
  }
  return membership;
}

function randomInviteCode(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

export async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomInviteCode();
    const existing = await prisma.room.findUnique({ where: { inviteCode: code } });
    if (!existing) return code;
  }
  throw new HttpError(500, 'Could not generate a unique invite code, try again');
}
