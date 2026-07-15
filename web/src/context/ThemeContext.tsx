import { useEffect, type ReactNode } from 'react';
import { DEFAULT_ACCENT } from '../theme/defaultTheme';
import { useView } from './ViewContext';

/** Applies the active room's accent color (or the default palette) as a CSS custom property. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { activeRoom } = useView();

  useEffect(() => {
    document.documentElement.style.setProperty('--sq-accent', activeRoom?.accentColor ?? DEFAULT_ACCENT);
  }, [activeRoom]);

  return <>{children}</>;
}
