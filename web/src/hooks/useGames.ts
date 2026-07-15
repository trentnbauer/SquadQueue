import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesApi } from '../api/games';
import type { GameStatus, VoteValue } from '@squadqueue/shared';

/** Handles listing + status/vote/remove mutations for either the personal shelf (roomId null) or a room. */
export function useGames(roomId: string | null) {
  const queryKey = roomId ? ['games', 'room', roomId] : ['games', 'shelf'];
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => (roomId ? gamesApi.room(roomId) : gamesApi.shelf()),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const updateStatus = useMutation({
    mutationFn: ({ gameId, status }: { gameId: string; status: GameStatus }) =>
      gamesApi.updateStatus(gameId, { status }),
    onSuccess: invalidate,
  });

  const vote = useMutation({
    mutationFn: ({ gameId, value }: { gameId: string; value: VoteValue }) => gamesApi.vote(gameId, { value }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (gameId: string) => gamesApi.remove(gameId),
    onSuccess: invalidate,
  });

  return {
    games: query.data?.games ?? [],
    isLoading: query.isLoading,
    invalidate,
    updateStatus: (gameId: string, status: GameStatus) => updateStatus.mutate({ gameId, status }),
    vote: (gameId: string, value: VoteValue) => vote.mutate({ gameId, value }),
    remove: (gameId: string) => remove.mutate(gameId),
  };
}
