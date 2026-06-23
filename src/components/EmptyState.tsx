import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  message: string;
  action?: ReactNode;
}

/** Schermata vuota riutilizzabile (nessun dato, nessun risultato…). */
export function EmptyState({ icon = '🧭', title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      {title && <h2 className="empty-state__title">{title}</h2>}
      <p className="empty-state__message">{message}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
