import type { ReactElement } from 'react';
import React from 'react';
import { ShareActions } from '../share/ShareActions';
import type { ButtonSize, ButtonVariant } from '../buttons/Button';
import { useShareDiscovery } from '../../hooks/useShareDiscovery';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { webappUrl } from '../../lib/constants';

interface ExploreFeedShareButtonProps {
  /** Bare app path of the active Explore sort, e.g. `/posts/upvoted`. */
  sharePath: string;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
  className?: string;
}

// Copy-link/share affordance for the Explore (discovery) feed headers. Always
// shares the canonical webapp URL of the active sort so links copied from the
// extension resolve too. Renders nothing unless the sharing-visibility +
// share_discovery flags are on, keeping flag-off DOM identical.
export function ExploreFeedShareButton({
  sharePath,
  buttonVariant,
  buttonSize,
  className,
}: ExploreFeedShareButtonProps): ReactElement | null {
  const { isEnabled } = useShareDiscovery();
  const { logEvent } = useLogContext();

  if (!isEnabled) {
    return null;
  }

  return (
    <ShareActions
      link={`${webappUrl}${sharePath.slice(1)}`}
      text="Explore what millions of developers are reading on daily.dev"
      // Feed cards ship their own per-post "Copy link" buttons, so the header
      // control needs a distinct accessible name.
      label="Copy link to feed"
      buttonVariant={buttonVariant}
      buttonSize={buttonSize}
      className={className}
      onShare={(provider) =>
        logEvent({
          event_name: LogEvent.ShareLog,
          target_id: sharePath,
          extra: JSON.stringify({ origin: Origin.ExploreFeed, provider }),
        })
      }
    />
  );
}
