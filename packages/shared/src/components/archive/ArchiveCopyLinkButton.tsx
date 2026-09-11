import type { ReactElement } from 'react';
import React from 'react';
import { ArchiveScopeType } from '../../graphql/archive';
import type { ArchiveScopeInfo } from '../../lib/archive';
import { CopyLinkButton } from '../share/CopyLinkButton';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';

interface ArchiveCopyLinkButtonProps {
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
  text: string;
}

const shareByScope: Record<
  ArchiveScopeInfo['scopeType'],
  { event: LogEvent; cid: ReferralCampaignKey }
> = {
  [ArchiveScopeType.Global]: {
    event: LogEvent.ShareArchive,
    cid: ReferralCampaignKey.Generic,
  },
  [ArchiveScopeType.Tag]: {
    event: LogEvent.ShareTag,
    cid: ReferralCampaignKey.ShareTag,
  },
  [ArchiveScopeType.Source]: {
    event: LogEvent.ShareSource,
    cid: ReferralCampaignKey.ShareSource,
  },
};

export const ArchiveCopyLinkButton = ({
  scopeType,
  scopeId,
  text,
}: ArchiveCopyLinkButtonProps): ReactElement => {
  const { event, cid } = shareByScope[scopeType];

  return (
    <CopyLinkButton
      origin={Origin.ArchiveIndex}
      shareProps={{
        text,
        link: globalThis?.location?.href,
        cid,
        logObject: () => ({
          event_name: event,
          target_id: scopeId,
        }),
      }}
    />
  );
};
