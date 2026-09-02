import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { ShareBand } from '../../../components/share/ShareBand';
import { useLogContext } from '../../../contexts/LogContext';
import type { Post } from '../../../graphql/posts';
import { postLogEvent } from '../../../lib/feed';
import { featureBriefingShareControls } from '../../../lib/featureManagement';
import type { Origin } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { ReferralCampaignKey } from '../../../lib/referral';
import type { ShareProvider } from '../../../lib/share';
import { useSharePlacement } from '../../snapshot/useSharePlacement';

interface BriefShareBandProps {
  post: Post;
  origin: Origin;
}

/**
 * Peak-end: finishing the briefing is the trigger, and the header control is
 * minutes of scrolling behind the reader by the time they get here.
 *
 * Same band as the end of a discussion — #6369's ShareBand, so the two
 * prompting surfaces cannot drift apart — with the briefing's own copy.
 */
export const BriefShareBand = ({
  post,
  origin,
}: BriefShareBandProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const isEnabled = useSharePlacement({
    feature: featureBriefingShareControls,
  });

  const onShare = useCallback(
    (provider: ShareProvider) =>
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider, origin },
        }),
      ),
    [logEvent, origin, post],
  );

  if (!isEnabled) {
    return null;
  }

  return (
    <ShareBand
      cid={ReferralCampaignKey.SharePost}
      description="Anyone with the link can read it"
      link={post.commentsPermalink}
      onShare={onShare}
      text={post.title ?? ''}
      title="Share your briefing"
    />
  );
};
