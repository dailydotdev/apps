import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../graphql/sources';
import { ShareActions } from '../../share/ShareActions';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';

interface SquadDirectoryShareButtonProps {
  squad: Squad;
  className?: string;
}

// Squads are sources in the data model, so directory shares reuse the existing
// `ShareSource` event (same shape as `SourceActions`); this surface is
// distinguished by `origin: squad directory` in `extra`.
export const SquadDirectoryShareButton = ({
  squad,
  className,
}: SquadDirectoryShareButtonProps): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <ShareActions
      link={squad.permalink}
      text={`Check out ${squad.handle} on daily.dev`}
      cid={ReferralCampaignKey.ShareSource}
      buttonVariant={ButtonVariant.Float}
      buttonSize={ButtonSize.Medium}
      label="Share Squad"
      className={className}
      onShare={(provider) =>
        logEvent({
          event_name: LogEvent.ShareSource,
          target_type: TargetType.Source,
          target_id: squad.id,
          extra: JSON.stringify({
            origin: Origin.SquadDirectory,
            provider,
          }),
        })
      }
    />
  );
};
