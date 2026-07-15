import { prisma } from '../db/client.js';
import { HttpError } from '../util/httpError.js';

export async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) {
    throw new HttpError(403, 'Administrator access required');
  }
  return user;
}
