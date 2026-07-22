import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import type { PostHeaderActionsProps } from '../common';
import Link from '../../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { settingsUrl } from '../../../lib/constants';
import { CopyIcon, LinkIcon, SettingsIcon } from '../../icons';
import { useSharePost } from '../../../hooks/useSharePost';
import { useShareCopyIcon } from '../../../hooks/useShareCopyIcon';
import { useShareBriefingDigest } from '../../../hooks/useShareBriefingDigest';
import { ShareActions } from '../../share/ShareActions';
import { useLogContext } from '../../../contexts/LogContext';
import { usePostLogEvent } from '../../../lib/feed';
import { LogEvent } from '../../../lib/log';
import type { Origin } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';

const Container = classed('div', 'flex flex-row items-center');

export const BriefPostHeaderActions = ({
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  origin,
  showShareButton = false,
  ...props
}: PostHeaderActionsProps & {
  origin: Origin;
  showShareButton?: boolean;
}): ReactElement => {
  const { copyLink } = useSharePost(origin);
  const showCopyIcon = useShareCopyIcon();
  const isShareEnabled = useShareBriefingDigest();
  const { logEvent } = useLogContext();
  const postLogEvent = usePostLogEvent();

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {/* Rendered outside the laptop-only wrapper: sharing a briefing is at
          least as valuable on mobile, where ShareActions taps straight through
          to the native share sheet. */}
      {showShareButton && isShareEnabled && (
        <ShareActions
          link={post?.commentsPermalink}
          text={post?.title ?? ''}
          cid={ReferralCampaignKey.SharePost}
          emailTitle={post?.title ?? ''}
          emailSummary={post?.summary}
          buttonVariant={ButtonVariant.Tertiary}
          buttonSize={ButtonSize.Medium}
          label="Share briefing"
          onShare={(provider) =>
            logEvent(
              postLogEvent(LogEvent.SharePost, post, {
                extra: { provider, origin },
              }),
            )
          }
        />
      )}
      <div className="hidden laptop:block">
        {showShareButton && !isShareEnabled && (
          <Button
            icon={showCopyIcon ? <CopyIcon /> : <LinkIcon />}
            size={ButtonSize.Medium}
            onClick={() => copyLink({ post })}
            aria-label="Copy link"
          />
        )}
        <Link passHref href={`${settingsUrl}/notifications`}>
          <Button icon={<SettingsIcon />} tag="a" size={ButtonSize.Medium} />
        </Link>
      </div>
    </Container>
  );
};
