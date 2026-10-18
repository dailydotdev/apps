import type { ReactElement } from 'react';
import React from 'react';
import { ArchiveScopeType } from '../../graphql/archive';
import type { ArchiveScopeInfo } from '../../lib/archive';
import { CopyLinkButton } from '../share/CopyLinkButton';
import type { UseShareOrCopyLinkProps } from '../../hooks/useShareOrCopyLink';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { ShellSquare } from '../shell/ShellSquare';
import { ShareIcon } from '../icons';
import { IconSize } from '../Icon';
import { LogEvent, Origin } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';

interface ArchiveCopyLinkButtonProps {
  scopeType: ArchiveScopeInfo['scopeType'];
  scopeId?: string;
  text: string;
  // In the phone's block it is the shell's share square; the page keeps
  // the copy link button elsewhere.
  inBlock?: boolean;
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

const ArchiveShareSquare = ({
  shareProps,
}: {
  shareProps: UseShareOrCopyLinkProps &
    Required<Pick<UseShareOrCopyLinkProps, 'logObject'>>;
}): ReactElement => {
  const [, onShareOrCopyLink] = useShareOrCopyLink({
    ...shareProps,
    logObject: (provider) => ({
      ...shareProps.logObject(provider),
      extra: JSON.stringify({ provider, origin: Origin.ArchiveIndex }),
    }),
  });

  return (
    <ShellSquare aria-label="Share" onClick={() => onShareOrCopyLink()}>
      <ShareIcon size={IconSize.Small} />
    </ShellSquare>
  );
};

export const ArchiveCopyLinkButton = ({
  scopeType,
  scopeId,
  text,
  inBlock = false,
}: ArchiveCopyLinkButtonProps): ReactElement => {
  const { event, cid } = shareByScope[scopeType];
  const shareProps = {
    text,
    link: globalThis?.location?.href,
    cid,
    logObject: () => ({
      event_name: event,
      target_id: scopeId,
    }),
  };

  if (inBlock) {
    return <ArchiveShareSquare shareProps={shareProps} />;
  }

  return (
    <CopyLinkButton origin={Origin.ArchiveIndex} shareProps={shareProps} />
  );
};
