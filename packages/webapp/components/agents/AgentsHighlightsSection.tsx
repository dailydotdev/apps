import type { ReactElement } from 'react';
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
}): ReactElement => {
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
        onClick={async (event) => {
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
      onClick={async (event) => {
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
  <div className="flex flex-col gap-1 px-3 py-2.5 laptop:px-4">
    <div className="h-4 w-3/4 animate-pulse rounded-8 bg-surface-float" />
    <div className="h-3 w-20 animate-pulse rounded-8 bg-surface-float" />
  </div>
);

export const AgentsHighlightsSection = ({
  highlights,
  loading,
  digestSource,
}: AgentsHighlightsSectionProps): ReactElement | null => {
  if (!loading && highlights.length === 0) {
    return null;
  }

  return (
    <section className="w-full border-b border-border-subtlest-tertiary pb-2 pt-4">
      <header className="mb-1.5 flex items-center gap-2 px-3 laptop:px-4">
        <h2 className="font-bold text-text-primary typo-title3">
          Happening Now
        </h2>
        {!!digestSource?.id && (
          <div className="ml-auto">
            <DigestSubscribeButton source={digestSource} />
          </div>
        )}
      </header>
      {loading ? (
        <>
          <HighlightSkeleton />
          <HighlightSkeleton />
          <HighlightSkeleton />
        </>
      ) : (
        highlights.map((highlight) => (
          <Link
            key={`${highlight.channel}-${highlight.post.id}`}
            href={highlight.post.commentsPermalink}
          >
            <a className="flex items-start gap-2 px-3 py-1.5 transition-colors hover:bg-surface-hover laptop:px-4">
              <span className="flex-1 break-words text-text-primary typo-callout">
                {highlight.headline}
              </span>
              <RelativeTime
                dateTime={highlight.post.createdAt}
                className="ml-auto shrink-0 text-text-tertiary typo-caption2"
              />
            </a>
          </Link>
        ))
      )}
    </section>
  );
};
