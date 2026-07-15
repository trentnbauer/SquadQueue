import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { PRICE_REGION_LABELS, type PriceRegion } from '@squadqueue/shared';

const STORAGE_KEY = 'sq-price-region';

function isPriceRegion(value: string | null): value is PriceRegion {
  return !!value && value in PRICE_REGION_LABELS;
}

function readStored(): PriceRegion | undefined {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isPriceRegion(stored) ? stored : undefined;
}

interface CurrencyRegionContextValue {
  region: PriceRegion | undefined;
  setRegion: (region: PriceRegion | undefined) => void;
}

const CurrencyRegionContext = createContext<CurrencyRegionContextValue | undefined>(undefined);

/** A per-browser display preference (not synced server-side — this is "what currency do I want to
 * see", not something that needs to follow you across devices for a friend-group app). Undefined
 * means "use the server's configured default region." Shared via context, not a standalone hook —
 * every component reading the region needs to see the SAME update the moment it's changed. */
export function CurrencyRegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<PriceRegion | undefined>(readStored);

  useEffect(() => {
    if (region) localStorage.setItem(STORAGE_KEY, region);
    else localStorage.removeItem(STORAGE_KEY);
  }, [region]);

  return <CurrencyRegionContext.Provider value={{ region, setRegion }}>{children}</CurrencyRegionContext.Provider>;
}

export function useCurrencyRegion() {
  const ctx = useContext(CurrencyRegionContext);
  if (!ctx) throw new Error('useCurrencyRegion must be used within CurrencyRegionProvider');
  return ctx;
}
