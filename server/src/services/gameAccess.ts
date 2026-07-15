import { prisma } from '../db/client.js';
import { HttpError } from '../util/httpError.js';
import { requireMembership } from './roomAccess.js';
import type { GameWithRelations } from './gameSerializer.js';
import { gameInclude } from './gameSerializer.js';

export async function loadGameOr404(gameId: string): Promise<GameWithRelations> {
  const game = await prisma.game.findUnique({ where: { id: gameId }, include: gameInclude });
  if (!game) throw new HttpError(404, 'Game not found');
  return game;
}

/** Any member can view/vote; a shelf item is only visible to its owner. */
export async function requireGameReadAccess(game: GameWithRelations, userId: string) {
  if (game.roomId === null) {
    if (game.addedBy !== userId) throw new HttpError(403, 'This is someone else\'s personal shelf item');
    return;
  }
  await requireMembership(game.roomId, userId);
}

/** Any room member can change status; a shelf item only its owner. Deleting someone else's room game needs elevation. */
export async function requireGameDeleteAccess(game: GameWithRelations, userId: string) {
  if (game.roomId === null) {
    if (game.addedBy !== userId) throw new HttpError(403, 'This is someone else\'s personal shelf item');
    return;
  }
  const membership = await requireMembership(game.roomId, userId);
  const isOwnGame = game.addedBy === userId;
  const isElevated = membership.role === 'room_master' || membership.role === 'moderator';
  if (!isOwnGame && !isElevated) {
    throw new HttpError(403, 'Only the Room Master or a Moderator can remove a game someone else added');
  }
}
