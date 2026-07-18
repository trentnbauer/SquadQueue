import { useEffect, useState } from 'react';
import type { GameStatus } from '@queueup/shared';
import { useAuth } from '../context/AuthContext';
import { useView } from '../context/ViewContext';
import { useGames } from '../hooks/useGames';
import { GameGrid } from '../components/GameGrid';
import { ActionErrorBanner } from '../components/ActionErrorBanner';
import { TruncatedListBanner } from '../components/TruncatedListBanner';
import { SteamImportCard } from '../components/SteamImportCard';
import { BulkActionBar } from '../components/BulkActionBar';
import styles from './ShelfView.module.css';

export function ShelfView() {
  const { user, steamLinked } = useAuth();
  const { switchView } = useView();
  const {
    games,
    truncated,
    isLoading,
    isError,
    loadError,
    refetch,
    invalidate,
    actionError,
    clearActionError,
    updateStatus,
    vote,
    remove,
    refreshPrice,
    isRefreshingPrice,
    setTargetPrice,
    bulkUpdateStatus,
    isBulkUpdatingStatus,
  } = useGames(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    switchView({ type: 'personal' });
  }, [switchView]);

  function exitBulkMode() {
    setBulkMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelect(gameId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) next.delete(gameId);
      else next.add(gameId);
      return next;
    });
  }

  async function handleBulkSetStatus(status: GameStatus) {
    if (selectedIds.size === 0) return;
    await bulkUpdateStatus(Array.from(selectedIds), status);
    setSelectedIds(new Set());
  }

  if (!user) return null;

  return (
    <div>
      {bulkMode ? (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={games.length}
          busy={isBulkUpdatingStatus}
          onSelectAll={() => setSelectedIds(new Set(games.map((g) => g.id)))}
          onClear={() => setSelectedIds(new Set())}
          onSetStatus={handleBulkSetStatus}
          onCancel={exitBulkMode}
        />
      ) : (
        games.length > 0 && (
          <div className={styles.toolbar}>
            <button type="button" className={styles.selectButton} onClick={() => setBulkMode(true)}>
              Select multiple
            </button>
          </div>
        )
      )}
      <ActionErrorBanner message={actionError} onDismiss={clearActionError} />
      <TruncatedListBanner truncated={truncated} />
      <GameGrid
        games={games}
        currentUserId={user.id}
        isLoading={isLoading}
        isError={isError}
        loadError={loadError}
        onRetry={refetch}
        onStatusChange={updateStatus}
        onVote={vote}
        onRemove={remove}
        onRefreshPrice={refreshPrice}
        isRefreshingPrice={isRefreshingPrice}
        onSetTargetPrice={setTargetPrice}
        showSpinWheel={!bulkMode}
        trailingCard={!bulkMode && <SteamImportCard steamLinked={steamLinked} onImported={invalidate} />}
        selectionMode={bulkMode}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />
    </div>
  );
}
