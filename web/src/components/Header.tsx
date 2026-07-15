import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useView } from '../context/ViewContext';
import { useRooms } from '../hooks/useRooms';
import { roomsApi } from '../api/rooms';
import { authApi } from '../api/auth';
import { AvatarBadge } from './AvatarBadge';
import { ACCENT_PRESETS } from '../theme/defaultTheme';
import styles from './Header.module.css';

export function Header() {
  const { user } = useAuth();
  const { activeRoom } = useView();
  const { rooms, createRoom, joinRoom } = useRooms();
  const navigate = useNavigate();

  const roomMenuRef = useRef<HTMLDetailsElement>(null);
  const profileMenuRef = useRef<HTMLDetailsElement>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const { data: membersData } = useQuery({
    queryKey: ['room-members', activeRoom?.id],
    queryFn: () => roomsApi.members(activeRoom!.id),
    enabled: !!activeRoom,
  });
  const members = membersData?.members ?? [];

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const accentColor = ACCENT_PRESETS[Math.floor(Math.random() * ACCENT_PRESETS.length)].value;
    const { room } = await createRoom.mutateAsync({ name: newRoomName.trim(), accentColor });
    setNewRoomName('');
    setShowCreateForm(false);
    roomMenuRef.current?.removeAttribute('open');
    navigate(`/room/${room.id}`);
  }

  async function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    const { room } = await joinRoom.mutateAsync({ inviteCode: inviteCode.trim() });
    setInviteCode('');
    setShowJoinForm(false);
    roomMenuRef.current?.removeAttribute('open');
    navigate(`/room/${room.id}`);
  }

  if (!user) return null;

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <a href="/" className={styles.brandName}>
          QUEUE<span style={{ color: 'var(--sq-accent)' }}>//</span>NIGHT
        </a>
        <div className={styles.tagline}>Games the squad wants to play together</div>
      </div>

      <div className={styles.right}>
        {activeRoom && members.length > 0 && (
          <div className={styles.avatarStack}>
            {members.map((m) => (
              <AvatarBadge key={m.user.id} name={m.user.displayName} color={m.user.avatarColor} size={32} />
            ))}
          </div>
        )}

        <details className={styles.menu} ref={roomMenuRef}>
          <summary className={styles.menuButton}>{activeRoom ? activeRoom.name : 'Personal Shelf'} ▾</summary>
          <div className={styles.menuPanel}>
            <a href="/" className={`${styles.menuItem} ${!activeRoom ? styles.menuItemActive : ''}`}>
              Personal Shelf
            </a>
            {rooms.length > 0 && <div className={styles.divider} />}
            {rooms.map((room) => (
              <a
                key={room.id}
                href={`/room/${room.id}`}
                className={`${styles.menuItem} ${activeRoom?.id === room.id ? styles.menuItemActive : ''}`}
              >
                {room.name}
              </a>
            ))}
            <div className={styles.divider} />
            {!showCreateForm && !showJoinForm && (
              <>
                <button className={styles.menuItem} onClick={() => setShowCreateForm(true)}>
                  + New room
                </button>
                <button className={styles.menuItem} onClick={() => setShowJoinForm(true)}>
                  Join with invite code
                </button>
              </>
            )}
            {showCreateForm && (
              <form className={styles.miniForm} onSubmit={handleCreateRoom}>
                <input
                  autoFocus
                  placeholder="Room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <button type="submit">Create room</button>
              </form>
            )}
            {showJoinForm && (
              <form className={styles.miniForm} onSubmit={handleJoinRoom}>
                <input
                  autoFocus
                  placeholder="Invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <button type="submit">Join room</button>
              </form>
            )}
            {activeRoom?.inviteCode && (
              <>
                <div className={styles.divider} />
                <div className={styles.menuItem} style={{ color: 'var(--sq-muted)' }}>
                  Invite code: <strong style={{ color: 'var(--sq-text)' }}>{activeRoom.inviteCode}</strong>
                </div>
              </>
            )}
          </div>
        </details>

        <details className={styles.menu} ref={profileMenuRef}>
          <summary className={styles.menuButton}>
            <AvatarBadge name={user.displayName} color={user.avatarColor} size={22} />
            Signed in as {user.displayName} ▾
          </summary>
          <div className={styles.menuPanel}>
            <a href={authApi.logoutUrl} className={styles.menuItem}>
              Sign out
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
