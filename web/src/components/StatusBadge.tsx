import type { GameStatus } from '@squadqueue/shared';

const STATUS_LABEL: Record<GameStatus, string> = {
  backlog: 'Backlog',
  playing: 'Playing',
  done: 'Done',
};

const STATUS_STYLE: Record<GameStatus, { bg: string; fg: string }> = {
  backlog: { bg: 'var(--sq-neutral-pill-bg)', fg: 'var(--sq-muted)' },
  playing: { bg: 'var(--sq-accent-pill-bg)', fg: 'var(--sq-accent)' },
  done: { bg: 'var(--sq-accent2-pill-bg)', fg: 'var(--sq-accent2)' },
};

const NEXT_STATUS: Record<GameStatus, GameStatus> = {
  backlog: 'playing',
  playing: 'done',
  done: 'backlog',
};

interface StatusBadgeProps {
  status: GameStatus;
  onClick?: (next: GameStatus) => void;
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const style = STATUS_STYLE[status];
  return (
    <button
      onClick={onClick ? () => onClick(NEXT_STATUS[status]) : undefined}
      title={onClick ? 'Click to change status' : undefined}
      style={{
        padding: '4px 11px',
        borderRadius: 999,
        background: style.bg,
        color: style.fg,
        fontWeight: 700,
        fontSize: 10.5,
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}
