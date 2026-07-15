import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useView } from '../context/ViewContext';
import { useGames } from '../hooks/useGames';
import { GameInputBar } from '../components/GameInputBar';
import { GameGrid } from '../components/GameGrid';

export function RoomView() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const { switchView } = useView();
  const { games, invalidate, updateStatus, vote, remove } = useGames(roomId ?? null);

  useEffect(() => {
    if (roomId) switchView({ type: 'room', roomId });
  }, [roomId, switchView]);

  if (!user || !roomId) return null;

  return (
    <div>
      <GameInputBar roomId={roomId} onAdded={invalidate} />
      <GameGrid
        games={games}
        currentUserId={user.id}
        onStatusChange={updateStatus}
        onVote={vote}
        onRemove={remove}
      />
    </div>
  );
}
