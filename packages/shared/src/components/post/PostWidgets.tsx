import type { ReactElement, ReactNode } from 'react';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { PageWidgets } from '../utilities';
import type { ShareMobileProps } from '../ShareMobile';
import { ShareMobile } from '../ShareMobile';
import AuthContext from '../../contexts/AuthContext';
import ShareBar from '../ShareBar';
import FurtherReading from '../widgets/FurtherReading';
import type { PostHeaderActionsProps } from './common';
import { FooterLinks } from '../footer';
import type { UserShortProfile } from '../../lib/user';
import type { SourceTooltip } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import EntityCardSkeleton from '../cards/entity/EntityCardSkeleton';
import { PostSidebarAdWidget } from './PostSidebarAdWidget';
import { FeaturedArchives } from '../widgets/FeaturedArchives';
import { MentionedToolsWidget } from '../brand/MentionedToolsWidget';
import { PostSignupWidget } from './PostSignupWidget';
import { HighlightPostSidebarWidget } from '../cards/highlight/HighlightPostSidebarWidget';

const UserEntityCard = dynamic(
  /* webpackChunkName: "userEntityCard" */ () =>
    import('../cards/entity/UserEntityCard'),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

const SourceEntityCard = dynamic(
  /* webpackChunkName: "sourceEntityCard" */ () =>
    import('../cards/entity/SourceEntityCard'),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

const SquadEntityCard = dynamic(
  /* webpackChunkName: "squadEntityCard" */ () =>
    import('../cards/entity/SquadEntityCard'),
  {
    loading: () => <EntityCardSkeleton />,
  },
);

/**
 * The points in the rail an ad template may follow with a slot: one per real
 * widget, in render order. PostSidebarAdWidget and MentionedToolsWidget are
 * absent on purpose — both are already commercial units, so following them
 * would stack two ads.
 */
export enum PostWidgetPosition {
  Source = 'source',
  Creator = 'creator',
  Share = 'share',
  Highlights = 'highlights',
  SimilarPosts = 'similarPosts',
}

export type PostWidgetsProps = Omit<PostHeaderActionsProps, 'contextMenuId'> &
  Omit<ShareMobileProps, 'link'> & {
    /** Ad templates optimise for impressions, not accounts. */
    hideSignupWidget?: boolean;
    /** Ad templates give the table of contents' space to a slot instead. */
    hideToc?: boolean;
    /** Renders a slot after the widget at each position. */
    getRailAd?: (position: PostWidgetPosition) => ReactNode;
    /** Rendered last, below the footer links. */
    trailing?: ReactNode;
    /** Drops the internal sidebar ad — for templates carrying their own. */
    hideAdWidget?: boolean;
  };

/**
 * Half the rail's widgets decide internally whether they have anything to show,
 * so an ad placed after one can end up following nothing and landing against
 * the previous ad. `display: contents` keeps the pair in the rail's own flex
 * flow, and the slot hides itself whenever it comes out first — which only
 * happens when its widget rendered nothing.
 */
function WidgetWithAd({
  widget,
  ad,
}: {
  widget: ReactNode;
  ad: ReactNode;
}): ReactElement {
  return (
    <div className="contents">
      {widget}
      <div className="contents [&:first-child]:hidden">{ad}</div>
    </div>
  );
}

export function PostWidgets({
  onCopyPostLink,
  post,
  className,
  origin,
  hideSignupWidget = false,
  hideToc = false,
  getRailAd,
  trailing,
  hideAdWidget,
}: PostWidgetsProps): ReactElement {
  const { tokenRefreshed } = useContext(AuthContext);
  const { source } = post;

  const cardClasses = 'w-full bg-transparent';

  const creator = post.author || post.scout;
  let sourceCard = null;

  if (source?.type === SourceType.Squad) {
    sourceCard = (
      <SquadEntityCard
        className={{
          container: cardClasses,
        }}
        handle={source.handle}
        origin={origin}
      />
    );
  } else if (source) {
    sourceCard = (
      <SourceEntityCard
        className={{
          container: cardClasses,
        }}
        source={source as SourceTooltip}
      />
    );
  }

  const withAd = (
    position: PostWidgetPosition,
    widget: ReactNode,
  ): ReactNode => {
    const ad = getRailAd?.(position);

    if (!ad) {
      return widget;
    }

    return <WidgetWithAd widget={widget} ad={ad} />;
  };

  return (
    <PageWidgets className={className}>
      {!hideSignupWidget && <PostSignupWidget />}
      {withAd(PostWidgetPosition.Source, sourceCard)}
      {withAd(
        PostWidgetPosition.Creator,
        creator && (
          <UserEntityCard
            className={{
              container: cardClasses,
            }}
            user={creator as UserShortProfile}
          />
        ),
      )}
      {!hideAdWidget && (
        <PostSidebarAdWidget
          postId={post.id}
          className={{ container: cardClasses }}
        />
      )}
      <MentionedToolsWidget postTags={post.tags || []} />
      {withAd(
        PostWidgetPosition.Share,
        <>
          <ShareBar post={post} />
          <ShareMobile
            post={post}
            origin={origin}
            link={post.commentsPermalink}
            onCopyPostLink={onCopyPostLink}
          />
        </>,
      )}
      {withAd(PostWidgetPosition.Highlights, <HighlightPostSidebarWidget />)}
      {tokenRefreshed && (
        <FurtherReading
          currentPost={post}
          hideToc={hideToc}
          betweenSections={getRailAd?.(PostWidgetPosition.SimilarPosts)}
        />
      )}
      <FeaturedArchives postId={post.id} />
      <FooterLinks />
      {trailing}
    </PageWidgets>
  );
}
