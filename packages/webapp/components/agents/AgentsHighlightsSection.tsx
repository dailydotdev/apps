import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import SourceActionsNotify from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsNotify';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useSourceActions } from '@dailydotdev/shared/src/hooks/source/useSourceActions';
import { RelativeTime } from '@dailydotdev/shared/src/components/utilities/RelativeTime';
import type { PostHighlight } from '@dailydotdev/shared/src/graphql/highlights';

const DigestSubscribeButton = ({
  source,
}: {
  source: Source;
}): ReactElement | null => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    enabled: isLoggedIn && !!source?.id,
  });
  const { isFollowing, toggleFollow, haveNotificationsOn, toggleNotify } =
    useSourceActions({ source });
  const isFollowStatePending =
    !isAuthReady || (isLoggedIn && (isFeedSettingsLoading || !feedSettings));

  if (isFollowStatePending) {
    return null;
  }

  if (isFollowing) {
    return (
      <SourceActionsNotify
        haveNotificationsOn={haveNotificationsOn}
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        onClick={async (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          await toggleNotify();
        }}
      />
    );
  }

  return (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      className="w-28"
      onClick={async (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleFollow();
      }}
    >
      Subscribe
    </Button>
  );
};

interface AgentsHighlightsSectionProps {
  highlights: PostHighlight[];
  loading: boolean;
  digestSource?: Source | null;
}

const HighlightSkeleton = (): ReactElement => (
  <div className="flex items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2">
    <div className="h-4 flex-1 animate-pulse rounded-8 bg-surface-hover" />
    <div className="h-3 w-10 shrink-0 animate-pulse rounded-8 bg-surface-hover" />
  </div>
);

export const AgentsHighlightsSection = ({
  highlights,
  loading,
  digestSource,
}: AgentsHighlightsSectionProps): ReactElement | null => {
  const visibleHighlights = highlights.slice(0, 5);

  if (!loading && highlights.length === 0) {
    return null;
  }

  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden">
      <header className="flex items-end justify-start gap-2 px-0 pb-2 pt-0">
        <h2 className="feed-highlights-title-gradient self-center font-bold leading-tight typo-title3">
          Happening Now
        </h2>
        {!!digestSource?.id && (
          <div className="ml-auto flex items-center">
            <DigestSubscribeButton source={digestSource} />
          </div>
        )}
      </header>
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-0 pb-2.5 pt-0">
        {loading ? (
          <>
            <HighlightSkeleton />
            <HighlightSkeleton />
            <HighlightSkeleton />
          </>
        ) : (
          <div className="divide-y divide-border-subtlest-tertiary">
            {visibleHighlights.map((highlight) => (
              <Link
                key={`${highlight.channel}-${highlight.post.id}`}
                href={highlight.post.commentsPermalink}
              >
                <a className="group flex flex-col gap-1 py-3 transition-colors">
                  <span
                    className="line-clamp-2 break-words text-text-primary transition-colors typo-callout"
                    style={{ fontSize: '17px' }}
                  >
                    {highlight.headline}
                  </span>
                  <RelativeTime
                    dateTime={highlight.highlightedAt}
                    className="text-text-tertiary"
                  />
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
