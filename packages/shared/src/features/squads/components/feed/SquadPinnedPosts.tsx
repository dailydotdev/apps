import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Post } from '../../../../graphql/posts';
import {
  collapsePinnedPosts,
  expandPinnedPosts,
  squadPinnedPostsQueryOptions,
} from '../../../../graphql/squads';
import { updateFlagsCache } from '../../../../graphql/source/common';
import {
  ArrowIcon,
  DiscussIcon,
  PinIcon,
  UpvoteIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { postLogEvent } from '../../../../lib/feed';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { useSquadPageContext } from '../../SquadPageContext';
import { isJoinedViewer } from '../../lib/viewer';
import { getSquadId } from '../../lib/features';

const PinnedCard = ({
  post,
  index,
}: {
  post: Post;
  index: number;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const href = post.commentsPermalink;

  return (
    <li className="shrink-0">
      <Link href={href} passHref>
        <a
          href={href}
          onClick={() =>
            logEvent(
              postLogEvent(LogEvent.Click, post, {
                extra: { origin: Origin.SquadPage, pinned: true },
                index,
              }),
            )
          }
          className="group relative flex h-40 w-52 flex-col justify-end overflow-hidden rounded-16 border border-border-subtlest-tertiary"
        >
          {post.image && (
            <img
              src={post.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform group-hover:scale-105"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-background-default via-background-default to-transparent opacity-[0.9]" />
          <span className="relative flex flex-col gap-1.5 p-3">
            <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
              {post.title ?? post.sharedPost?.title}
            </span>
            <span className="flex items-center gap-3 text-text-tertiary typo-caption1">
              <span className="flex items-center gap-1 tabular-nums">
                <UpvoteIcon size={IconSize.Size16} />
                {largeNumberFormat(post.numUpvotes ?? 0) ?? 0}
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <DiscussIcon size={IconSize.Size16} />
                {largeNumberFormat(post.numComments ?? 0) ?? 0}
              </span>
            </span>
          </span>
        </a>
      </Link>
    </li>
  );
};

export const SquadPinnedPosts = (): ReactElement | null => {
  const { squad, viewer } = useSquadPageContext();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { data: pins } = useQuery(
    squadPinnedPostsQueryOptions({ squad, user }),
  );
  const [isLocallyCollapsed, setIsLocallyCollapsed] = useState(false);
  const isJoined = isJoinedViewer(viewer);
  // Members keep their choice on the membership; everyone else per visit.
  const isCollapsed = isJoined
    ? !!squad.currentMember?.flags?.collapsePinnedPosts
    : isLocallyCollapsed;

  const { mutate: togglePinned, isPending } = useMutation({
    mutationFn: () =>
      (isCollapsed ? expandPinnedPosts : collapsePinnedPosts)(
        getSquadId(squad),
      ),
    onSuccess: () => {
      if (user) {
        updateFlagsCache(client, squad, user, {
          collapsePinnedPosts: !isCollapsed,
        });
      }
    },
  });

  if (!pins?.length) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2 px-4 tablet:px-0">
      <button
        type="button"
        aria-expanded={!isCollapsed}
        disabled={isPending}
        onClick={() =>
          isJoined ? togglePinned() : setIsLocallyCollapsed(!isCollapsed)
        }
        className="flex items-center gap-1.5 self-start text-text-secondary typo-footnote hover:text-text-primary"
      >
        <PinIcon size={IconSize.Size16} secondary />
        <span className="font-bold">
          Pinned posts{isCollapsed && ` (${pins.length})`}
        </span>
        <ArrowIcon
          size={IconSize.Size16}
          className={classNames(
            'transition-transform',
            isCollapsed && 'rotate-180',
          )}
        />
      </button>
      {!isCollapsed && (
        <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 tablet:mx-0 tablet:px-0">
          {pins.map((post, index) => (
            <PinnedCard key={post.id} post={post} index={index} />
          ))}
        </ul>
      )}
    </section>
  );
};
