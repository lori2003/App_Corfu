interface SpinnerProps {
  label?: string;
}

/** Indicatore di caricamento accessibile. */
export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__circle" aria-hidden="true" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  );
}
