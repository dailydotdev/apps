import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { ChannelDigestConfiguration } from '../../graphql/highlights';
import type { Source } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useSourceActionsFollow } from '../../hooks/source/useSourceActionsFollow';
import { useSourceActionsNotify } from '../../hooks/source/useSourceActionsNotify';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';
import Link from '../utilities/Link';
import { HighlightShareButton } from './HighlightShareButton';
import { ButtonSize } from '../buttons/Button';
import { ReferralCampaignKey } from '../../lib/referral';

const CTA_HEIGHT = 'h-10';

const DigestCTASkeleton = (): ReactElement => (
  <div className={`flex items-center gap-2 px-4 py-2 ${CTA_HEIGHT}`}>
    <div className="h-4 w-3/4 animate-pulse rounded-8 bg-surface-float" />
    <div className="ml-auto h-8 w-8 animate-pulse rounded-8 bg-surface-float" />
  </div>
);

interface DigestCTAProps {
  digest: ChannelDigestConfiguration;
  displayName: string;
  /**
   * Absolute link to this channel's Happening Now tab. Only set when
   * `share_happening_now` is on, so the control is gated on the prop and the
   * flag-off DOM is untouched.
   */
  shareLink?: string;
}

interface DigestCTAContentProps extends DigestCTAProps {
  source: Source;
}

const DigestCTAContent = ({
  digest,
  displayName,
  shareLink,
  source,
}: DigestCTAContentProps): ReactElement => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings();
  const { isFollowing, toggleFollow } = useSourceActionsFollow({
    source,
  });
  const { haveNotificationsOn, onNotify } = useSourceActionsNotify({
    source,
  });

  const isUserStateLoading =
    !isAuthReady || (isLoggedIn && (isFeedSettingsLoading || !feedSettings));

  const onToggleSubscription = useCallback(async () => {
    if (!isFollowing) {
      await toggleFollow();
    }

    await onNotify();
  }, [isFollowing, toggleFollow, onNotify]);

  if (isUserStateLoading) {
    return <DigestCTASkeleton />;
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 text-text-tertiary typo-callout ${CTA_HEIGHT}`}
    >
      {/* The share control eats horizontal room, so the copy only gets the
      shrink + ellipsis treatment when it is actually rendered. */}
      <span className={classNames(shareLink && 'min-w-0 flex-1 truncate')}>
        Get a {digest.frequency} digest of{' '}
        <Link href={source.permalink}>
          <a className="font-bold text-text-primary hover:underline">
            {displayName}
          </a>
        </Link>{' '}
        news
      </span>
      {shareLink && (
        <HighlightShareButton
          link={shareLink}
          text={`Follow ${displayName} news on daily.dev`}
          label={`Share ${displayName}`}
          level="topic"
          targetId={source.id ?? displayName}
          cid={ReferralCampaignKey.Generic}
          buttonSize={ButtonSize.XSmall}
          className="ml-auto shrink-0"
        />
      )}
      <span className={classNames('shrink-0', !shareLink && 'ml-auto')}>
        <SourceActionsNotify
          haveNotificationsOn={haveNotificationsOn}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleSubscription();
          }}
        />
      </span>
    </div>
  );
};

export const DigestCTA = ({
  digest,
  displayName,
  shareLink,
}: DigestCTAProps): ReactElement | null => {
  const source = digest.source
    ? {
        ...digest.source,
        type: SourceType.Machine,
        public: true,
      }
    : null;

  if (!source) {
    return null;
  }

  return (
    <DigestCTAContent
      digest={digest}
      displayName={displayName}
      shareLink={shareLink}
      source={source}
    />
  );
};
