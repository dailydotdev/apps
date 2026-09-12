import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { ShareBand } from '../../../components/share/ShareBand';
import { useLogContext } from '../../../contexts/LogContext';
import type { Post } from '../../../graphql/posts';
import { postLogEvent } from '../../../lib/feed';
import { LogEvent, Origin } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';
import type { ShareProvider } from '../../../lib/share';

/**
 * Finishing the briefing is the moment to pass it on, and the header control
 * is minutes of scrolling behind the reader by then. The same band as the end
 * of a discussion, with the briefing's own copy.
 */
export const BriefShareBand = ({ post }: { post: Post }): ReactElement => {
  const { logEvent } = useLogContext();

  const onShare = useCallback(
    (provider: ShareProvider) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin: Origin.EndOfBriefing },
        }),
      ),
    [logEvent, post],
  );

  return (
    <ShareBand
      cid={ReferralCampaignKey.SharePost}
      description="Anyone with the link can read it"
      link={post.commentsPermalink}
      onShare={onShare}
      text={post.title ?? ''}
      title="Share this briefing"
    />
  );
};
