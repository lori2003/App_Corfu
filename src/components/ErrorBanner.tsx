interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Banner d'errore con eventuale azione "Riprova". */
export function ErrorBanner({ message, onRetry, retryLabel = 'Riprova' }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner__icon" aria-hidden="true">
        ⚠️
      </span>
      <span className="error-banner__message">{message}</span>
      {onRetry && (
        <button type="button" className="btn btn--small" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
