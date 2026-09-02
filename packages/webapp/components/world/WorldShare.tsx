import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { useShareOrCopyLink } from '@dailydotdev/shared/src/hooks/useShareOrCopyLink';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import type { ShareProvider } from '@dailydotdev/shared/src/lib/share';

interface WorldShareProps {
  user: PublicProfile;
  /** What the owner calls the place, if they have named it. */
  worldName?: string;
  /** Whether the viewer is looking at their own world. */
  isOwn: boolean;
  className?: string;
}

/**
 * Hands out the link to this world. The same button in both places the world
 * keeps chrome: beside the immersive toggle in the rail, beside the way out on
 * a phone.
 *
 * `useShareOrCopyLink` is what makes one button right for both. On a phone it
 * opens the native sheet, which is where a world is most likely to be passed
 * on; anywhere else it copies and toasts. That is also why the tooltip talks
 * about copying — it only ever appears on the pointer that does the copying.
 *
 * Absolute rather than the router's path: the whole point of the button is a
 * link that survives leaving the tab.
 */
export function WorldShare({
  user,
  worldName,
  isOwn,
  className,
}: WorldShareProps): ReactElement {
  const whose = isOwn ? 'my' : `${user.name}'s`;
  const [copying, onShareOrCopy] = useShareOrCopyLink({
    link: `${webappUrl}world/${user.username || user.id}`,
    text: worldName
      ? `Check out ${worldName}, ${whose} world on daily.dev`
      : `Check out ${whose} world on daily.dev`,
    logObject: (provider: ShareProvider) => ({
      event_name: LogEvent.ShareWorld,
      target_id: user.id,
      extra: JSON.stringify({ provider }),
    }),
  });

  return (
    <Tooltip content={copying ? 'Copied!' : 'Copy link'}>
      <Button
        type="button"
        aria-label={copying ? 'Copied!' : 'Share this world'}
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<ShareIcon secondary={copying} />}
        onClick={() => onShareOrCopy()}
        className={className}
      />
    </Tooltip>
  );
}
