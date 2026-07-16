import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROOM_PLATFORM_LABELS, type RoomPlatform } from '@squadqueue/shared';
import { useAuth } from '../context/AuthContext';
import { useView } from '../context/ViewContext';
import { useRooms } from '../hooks/useRooms';
import { authApi } from '../api/auth';
import { AvatarBadge } from './AvatarBadge';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { ACCENT_PRESETS } from '../theme/defaultTheme';
import styles from './Sidebar.module.css';

const ROOM_PLATFORM_OPTIONS = Object.keys(ROOM_PLATFORM_LABELS) as RoomPlatform[];

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Prefers a preset none of the user's current rooms are already using, so rooms read as visually
 * distinct at a glance in the sidebar - only falls back to a plain random pick once every preset
 * is already in use. */
function pickAccentColor(existingRooms: { accentColor: string }[]): string {
  const used = new Set(existingRooms.map((r) => r.accentColor));
  const available = ACCENT_PRESETS.filter((p) => !used.has(p.value));
  const pool = available.length > 0 ? available : ACCENT_PRESETS;
  return pool[Math.floor(Math.random() * pool.length)].value;
}

/** Discord-style server rail: rooms (and the Personal Shelf) live as icons in a vertical strip on
 * the far left, with account controls anchored to the bottom - instead of dropdown menus for
 * switching rooms and reaching profile settings. */
export function Sidebar() {
  const { user } = useAuth();
  const { activeRoom } = useView();
  const { rooms, createRoom, joinRoom } = useRooms();
  const navigate = useNavigate();

  const addRoomMenuRef = useRef<HTMLDetailsElement>(null);
  const profileMenuRef = useRef<HTMLDetailsElement>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPlatform, setNewRoomPlatform] = useState<RoomPlatform>('pc');
  const [inviteCode, setInviteCode] = useState('');
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  function closeAddRoomMenu() {
    addRoomMenuRef.current?.removeAttribute('open');
    setShowCreateForm(false);
    setShowJoinForm(false);
  }

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const accentColor = pickAccentColor(rooms);
    const { room } = await createRoom.mutateAsync({ name: newRoomName.trim(), platform: newRoomPlatform, accentColor });
    setNewRoomName('');
    setNewRoomPlatform('pc');
    closeAddRoomMenu();
    navigate(`/room/${room.id}`);
  }

  async function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inviteCode.trim();
    if (!trimmed) return;
    // Accept either a bare code or a pasted full invite link (e.g. https://.../join/ABC123).
    const pastedLinkMatch = trimmed.match(/\/join\/([^/?#]+)/);
    const code = pastedLinkMatch ? decodeURIComponent(pastedLinkMatch[1]) : trimmed;
    const { room } = await joinRoom.mutateAsync({ inviteCode: code });
    setInviteCode('');
    closeAddRoomMenu();
    navigate(`/room/${room.id}`);
  }

  if (!user) return null;

  return (
    <nav className={styles.sidebar} aria-label="Rooms">
      <div className={styles.brand} title="SquadQueue">
        SQ
      </div>
      <div className={styles.divider} />

      <div className={styles.icons}>
        <Link
          to="/"
          className={`${styles.roomIcon} ${!activeRoom ? styles.roomIconActive : ''}`}
          title="Personal Shelf"
        >
          🗂
        </Link>

        {rooms.map((room) => (
          <Link
            key={room.id}
            to={`/room/${room.id}`}
            className={`${styles.roomIcon} ${activeRoom?.id === room.id ? styles.roomIconActive : ''}`}
            style={{ background: room.accentColor }}
            title={`${room.name} · ${ROOM_PLATFORM_LABELS[room.platform]}`}
          >
            {initials(room.name)}
          </Link>
        ))}
      </div>

      {/* Rendered outside the scrolling .icons list (and outside any other overflow:auto
          ancestor) so its flyout - and the profile flyout below - never get clipped by a
          scroll container's overflow. */}
      <details className={styles.menu} ref={addRoomMenuRef}>
        <summary className={styles.addRoomIcon} title="Create or join a room" aria-label="Create or join a room">
          +
        </summary>
        <div className={styles.flyout}>
          {!showCreateForm && !showJoinForm && (
            <>
              <button className={styles.menuItem} onClick={() => setShowCreateForm(true)}>
                Create a new room
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
              <select value={newRoomPlatform} onChange={(e) => setNewRoomPlatform(e.target.value as RoomPlatform)}>
                {ROOM_PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {ROOM_PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
              <button type="submit">Create room</button>
            </form>
          )}
          {showJoinForm && (
            <form className={styles.miniForm} onSubmit={handleJoinRoom}>
              <input
                autoFocus
                placeholder="Invite code or link"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <button type="submit">Join room</button>
            </form>
          )}
        </div>
      </details>

      <details className={styles.menu} ref={profileMenuRef}>
        <summary className={styles.userPanel} aria-label={`Signed in as ${user.displayName}`}>
          <AvatarBadge name={user.displayName} color={user.avatarColor} avatarUrl={user.avatarUrl} size={36} />
        </summary>
        <div className={`${styles.flyout} ${styles.flyoutBottom}`}>
          <div className={styles.userName}>{user.displayName}</div>
          <div className={styles.hDivider} />
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              profileMenuRef.current?.removeAttribute('open');
              setShowProfileSettings(true);
            }}
          >
            Profile settings
          </button>
          {user.isAdmin && (
            <Link to="/settings" className={styles.menuItem} onClick={() => profileMenuRef.current?.removeAttribute('open')}>
              Administrator settings
            </Link>
          )}
          <div className={styles.hDivider} />
          <a href={authApi.logoutUrl} className={styles.menuItem}>
            Sign out
          </a>
        </div>
      </details>

      {showProfileSettings && <ProfileSettingsModal onClose={() => setShowProfileSettings(false)} />}
    </nav>
  );
}
