import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Room } from '@squadqueue/shared';

export type View = { type: 'personal' } | { type: 'room'; roomId: string };

interface ViewContextValue {
  view: View;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  switchView: (view: View) => void;
  activeRoom: Room | null;
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ type: 'personal' });
  const [rooms, setRooms] = useState<Room[]>([]);

  const activeRoom = view.type === 'room' ? (rooms.find((r) => r.id === view.roomId) ?? null) : null;

  return (
    <ViewContext.Provider value={{ view, rooms, setRooms, switchView: setView, activeRoom }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error('useView must be used within ViewProvider');
  return ctx;
}
