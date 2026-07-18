import { useEffect, useRef, useState } from 'react';
import type { SteamImportProgress } from '@queueup/shared';
import { gamesApi } from '../api/games';

const PROGRESS_POLL_INTERVAL_MS = 1000;

// Set right before redirecting to Steam sign-in to link an account, and consumed on the way back
// (see the effect below) - the whole point of linking was to import, so once the link succeeds the
// import should run immediately rather than making the user click "Import" a second time after
// already having gone through the Steam sign-in flow once for this same action.
const PENDING_IMPORT_KEY = 'queueup-pending-steam-import';

/** Shared Steam-library-import flow (start link, run import, poll progress) behind one hook so it
 * can be triggered from more than one place in the UI (the shelf grid's SteamImportCard tile, and
 * the header's re-sync button - issue #203) without duplicating the polling/state logic. */
export function useSteamImport(steamLinked: boolean, onImported: () => void) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SteamImportProgress | null>(null);
  const autoImportRan = useRef(false);

  useEffect(() => {
    if (!steamLinked || autoImportRan.current || !sessionStorage.getItem(PENDING_IMPORT_KEY)) return;
    autoImportRan.current = true;
    sessionStorage.removeItem(PENDING_IMPORT_KEY);
    runImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steamLinked]);

  function startLink() {
    sessionStorage.setItem(PENDING_IMPORT_KEY, '1');
    window.location.href = '/auth/steam/link';
  }

  async function runImport() {
    setBusy(true);
    setResult(null);
    setError(null);
    setProgress(null);

    // The import itself is one request that only resolves once the whole batch is done (one IGDB
    // lookup per unowned game), so polling a separate progress endpoint alongside it is what gives
    // this a live "X of Y checked" readout instead of a bare spinner for however long that takes.
    const pollInterval = setInterval(async () => {
      try {
        const { progress: latest } = await gamesApi.importSteamLibraryProgress();
        if (latest && !latest.done) setProgress(latest);
      } catch {
        // A failed poll just means the next tick tries again - the import itself isn't affected.
      }
    }, PROGRESS_POLL_INTERVAL_MS);

    try {
      const { imported, skipped, totalOwned, consideredCount } = await gamesApi.importSteamLibrary();
      setResult(
        imported === 0
          ? `No new games to add (checked ${consideredCount} of ${totalOwned} owned).`
          : `Added ${imported} game${imported === 1 ? '' : 's'} (skipped ${skipped}, checked ${consideredCount} of ${totalOwned} owned).`,
      );
      if (imported > 0) onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import your Steam library');
    } finally {
      clearInterval(pollInterval);
      setProgress(null);
      setBusy(false);
    }
  }

  return { busy, result, error, progress, startLink, runImport };
}
