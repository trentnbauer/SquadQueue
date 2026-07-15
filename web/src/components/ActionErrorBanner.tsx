import styles from './ActionErrorBanner.module.css';

interface ActionErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export function ActionErrorBanner({ message, onDismiss }: ActionErrorBannerProps) {
  if (!message) return null;

  return (
    <div className={styles.banner} role="alert">
      <span>{message}</span>
      <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
