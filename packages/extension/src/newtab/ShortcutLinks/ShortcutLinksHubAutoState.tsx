import type { ReactElement } from 'react';
import React from 'react';

interface ShortcutLinksHubAutoStateProps {
  showPermissionCta: boolean;
  showNoHistoryMessage: boolean;
  onAskPermission: () => void | Promise<boolean>;
}

export function ShortcutLinksHubAutoState({
  showPermissionCta,
  showNoHistoryMessage,
  onAskPermission,
}: ShortcutLinksHubAutoStateProps): ReactElement | null {
  if (!showPermissionCta && !showNoHistoryMessage) {
    return null;
  }

  return (
    <>
      {showPermissionCta && (
        <button
          type="button"
          onClick={onAskPermission}
          className="flex h-11 items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 text-text-tertiary transition-colors duration-150 typo-callout hover:border-solid hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary motion-reduce:transition-none"
        >
          Grant access to show Most visited sites
        </button>
      )}
      {showNoHistoryMessage && (
        <span className="flex h-11 items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 text-text-tertiary typo-callout">
          Nothing visited yet — check back after browsing a few sites
        </span>
      )}
    </>
  );
}
