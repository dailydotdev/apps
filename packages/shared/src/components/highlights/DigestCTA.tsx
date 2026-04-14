import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { ChannelDigestConfiguration } from '../../graphql/highlights';
import type { Source } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useSourceActionsFollow } from '../../hooks/source/useSourceActionsFollow';
import { useSourceActionsNotify } from '../../hooks/source/useSourceActionsNotify';
import { AuthTriggers } from '../../lib/auth';
import SourceActionsNotify from '../sources/SourceActions/SourceActionsNotify';
import Link from '../utilities/Link';

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
}

export const DigestCTA = ({
  digest,
  displayName,
}: DigestCTAProps): ReactElement | null => {
  const { source } = digest;
  const { isAuthReady, isLoggedIn, showLogin } = useAuthContext();
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    enabled: isLoggedIn && !!source?.id,
  });
  const { isFollowing, toggleFollow } = useSourceActionsFollow({
    source: source as Source,
  });
  const { haveNotificationsOn, onNotify } = useSourceActionsNotify({
    source,
  });

  const isUserStateLoading =
    !isAuthReady || (isLoggedIn && (isFeedSettingsLoading || !feedSettings));

  const onToggleSubscription = useCallback(async () => {
    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.SourceSubscribe });
      return;
    }

    if (haveNotificationsOn) {
      await onNotify();
      return;
    }

    if (!isFollowing) {
      try {
        await toggleFollow();
      } catch {
        // already following, ignore
      }
    }

    await onNotify();
  }, [
    isLoggedIn,
    showLogin,
    haveNotificationsOn,
    isFollowing,
    toggleFollow,
    onNotify,
  ]);

  if (!source) {
    return null;
  }

  if (isUserStateLoading) {
    return <DigestCTASkeleton />;
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 text-text-tertiary typo-callout ${CTA_HEIGHT}`}
    >
      <span>
        Get a {digest.frequency} digest of{' '}
        <Link href={source.permalink}>
          <a className="font-bold text-text-primary hover:underline">
            {displayName}
          </a>
        </Link>{' '}
        news
      </span>
      <span className="ml-auto shrink-0">
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
