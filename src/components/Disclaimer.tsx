import { useApp } from '../context/AppContext';

/** Nota informativa: i dati sono stime e vanno verificati. */
export function Disclaimer() {
  const { t } = useApp();
  return (
    <p className="disclaimer" role="note">
      ℹ️ {t.common.disclaimer}
    </p>
  );
}
