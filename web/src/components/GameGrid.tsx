import type { Game, GameStatus, VoteValue } from '@squadqueue/shared';
import { GameCard } from './GameCard';
import styles from './GameGrid.module.css';

function sortByRecent(games: Game[]): Game[] {
  return [...games].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

interface GameGridProps {
  games: Game[];
  currentUserId: string;
  onStatusChange: (gameId: string, status: GameStatus) => void;
  onVote: (gameId: string, value: VoteValue) => void;
  onRemove: (gameId: string) => void;
}

export function GameGrid({ games, currentUserId, onStatusChange, onVote, onRemove }: GameGridProps) {
  const sorted = sortByRecent(games);

  if (sorted.length === 0) {
    return <div className={styles.empty}>Nothing here yet.</div>;
  }

  return (
    <div className={styles.cards}>
      {sorted.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          currentUserId={currentUserId}
          onStatusChange={(next) => onStatusChange(game.id, next)}
          onVote={(value) => onVote(game.id, value)}
          onRemove={() => onRemove(game.id)}
        />
      ))}
    </div>
  );
}
