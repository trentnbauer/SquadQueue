import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RoomRole } from '@squadqueue/shared';
import { useAuth } from '../context/AuthContext';
import { useView } from '../context/ViewContext';
import { useConfirm } from '../context/ConfirmContext';
import { useGames } from '../hooks/useGames';
import { roomsApi } from '../api/rooms';
import { AvatarBadge } from './AvatarBadge';
import { RoomSettingsModal } from './RoomSettingsModal';
import styles from './Header.module.css';

const ROLE_LABEL: Record<RoomRole, string> = {
  room_master: 'Room Master',
  moderator: 'Moderator',
  member: 'Member',
};

export function Header() {
  const { user } = useAuth();
  const { activeRoom } = useView();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const membersMenuRef = useRef<HTMLDetailsElement>(null);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const membersQueryKey = ['room-members', activeRoom?.id];
  const { data: membersData } = useQuery({
    queryKey: membersQueryKey,
    queryFn: () => roomsApi.members(activeRoom!.id),
    enabled: !!activeRoom,
  });
  const members = membersData?.members ?? [];
  const myRole = activeRoom?.myRole;

  // Reuses the same ['games', 'room'|'shelf', ...] query as the active view (RoomView/ShelfView) -
  // React Query dedupes by queryKey, so this doesn't trigger an extra network fetch.
  const { games } = useGames(activeRoom?.id ?? null);

  function canPromote(memberRole: RoomRole): boolean {
    return myRole === 'room_master' && memberRole === 'member';
  }

  function canRemove(memberUserId: string, memberRole: RoomRole): boolean {
    if (memberRole === 'room_master') return false; // never removable, including by themselves
    if (memberUserId === user?.id) return true; // leave
    return myRole === 'room_master' || myRole === 'moderator';
  }

  async function handlePromote(targetUserId: string) {
    if (!activeRoom) return;
    await roomsApi.setRole(activeRoom.id, targetUserId, 'moderator');
    queryClient.invalidateQueries({ queryKey: membersQueryKey });
  }

  async function handleRemove(targetUserId: string, isSelf: boolean) {
    if (!activeRoom) return;
    const ok = await confirm({
      message: isSelf ? 'Leave this room?' : 'Remove this member from the room?',
      confirmLabel: isSelf ? 'Leave' : 'Remove',
      danger: true,
    });
    if (!ok) return;
    await roomsApi.removeMember(activeRoom.id, targetUserId);
    queryClient.invalidateQueries({ queryKey: membersQueryKey });
    if (isSelf) {
      membersMenuRef.current?.removeAttribute('open');
      navigate('/');
    }
  }

  async function handleCopyInviteCode() {
    if (!activeRoom?.inviteCode) return;
    await navigator.clipboard.writeText(`${window.location.origin}/join/${activeRoom.inviteCode}`);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 1500);
  }

  if (!user) return null;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.title}>{activeRoom ? activeRoom.name : 'Personal Shelf'}</div>

        {activeRoom?.inviteCode && (
          <button
            type="button"
            className={styles.inviteBadge}
            onClick={handleCopyInviteCode}
            title="Click to copy a shareable invite link"
            aria-label="Copy room invite link"
          >
            {inviteCopied ? 'Copied!' : `Invite: ${activeRoom.inviteCode}`}
          </button>
        )}

        {activeRoom && (
          <button
            type="button"
            className={styles.settingsButton}
            onClick={() => setShowRoomSettings(true)}
            title="Room info & settings"
            aria-label="Room info & settings"
          >
            ⚙
          </button>
        )}
      </div>

      {showRoomSettings && activeRoom && (
        <RoomSettingsModal
          room={activeRoom}
          members={members}
          games={games}
          onClose={() => setShowRoomSettings(false)}
        />
      )}

      <div className={styles.right}>
        {activeRoom && members.length > 0 && (
          <details className={styles.menu} ref={membersMenuRef}>
            <summary className={styles.avatarStackButton}>
              <div className={styles.avatarStack}>
                {members.map((m) => (
                  <AvatarBadge
                    key={m.user.id}
                    name={m.user.displayName}
                    color={m.user.avatarColor}
                    avatarUrl={m.user.avatarUrl}
                    size={32}
                  />
                ))}
              </div>
            </summary>
            <div className={styles.menuPanel}>
              {members.map((m) => {
                const isSelf = m.user.id === user.id;
                return (
                  <div key={m.user.id} className={styles.memberRow}>
                    <AvatarBadge name={m.user.displayName} color={m.user.avatarColor} avatarUrl={m.user.avatarUrl} size={22} />
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>
                        {m.user.displayName}
                        {isSelf ? ' (you)' : ''}
                      </span>
                      <span className={styles.memberRole}>{ROLE_LABEL[m.role]}</span>
                    </div>
                    {canPromote(m.role) && (
                      <button className={styles.memberAction} onClick={() => handlePromote(m.user.id)}>
                        Promote
                      </button>
                    )}
                    {canRemove(m.user.id, m.role) && (
                      <button className={styles.memberAction} onClick={() => handleRemove(m.user.id, isSelf)}>
                        {isSelf ? 'Leave' : 'Remove'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </header>
  );
}
