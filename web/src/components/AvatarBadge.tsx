interface AvatarBadgeProps {
  name: string;
  color: string;
  size?: number;
  title?: string;
}

export function AvatarBadge({ name, color, size = 28, title }: AvatarBadgeProps) {
  return (
    <div
      title={title ?? name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.42,
        flex: 'none',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
