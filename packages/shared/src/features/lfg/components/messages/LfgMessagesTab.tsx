import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { SidebarCountBadge } from '../../../../components/sidebar/SidebarCountBadge';
import { SignalIcon } from '../../../../components/icons/Signal';
import { PlusIcon } from '../../../../components/icons/Plus';
import { VolunteeringIcon } from '../../../../components/icons/Volunteering';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import {
  lfgBoardQueryOptions,
  lfgHelperQueryOptions,
  myLfgPostQueryOptions,
} from '../../queries';
import { getLfgUrl, lfgDaysLeft, lfgNewPostUrl } from '../../lib/format';
import { useLfgModals } from '../../hooks/useLfgModals';
import { noLfgFilters } from '../board/LfgFilters';
import { LfgRow } from '../LfgRow';

const LFG_TAB_POSTS = 3;

const rowClassName =
  'flex h-11 w-full items-center gap-3 px-4 text-left typo-callout hover:bg-surface-hover';

const RowContent = ({
  icon,
  label,
  meta,
  count = 0,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  count?: number;
}): ReactElement => (
  <>
    <span className="flex text-text-secondary">{icon}</span>
    <span className="flex-1 truncate">{label}</span>
    {meta && (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        {meta}
      </Typography>
    )}
    {count > 0 && <SidebarCountBadge count={count} />}
  </>
);

const LinkRow = ({
  href,
  ...props
}: Parameters<typeof RowContent>[0] & { href: string }): ReactElement => (
  <Link href={href} passHref>
    <a href={href} className={rowClassName}>
      <RowContent {...props} />
    </a>
  </Link>
);

// The phone version of the rail's Looking for group rows, in the same order,
// then the newest people looking so the board is one tap from the inbox.
export const LfgMessagesTab = (): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { openReachOut, openHelper } = useLfgModals();
  const { data: myPost } = useQuery(myLfgPostQueryOptions(user));
  const { data: helper } = useQuery(lfgHelperQueryOptions(user));
  const { data: board } = useInfiniteQuery(
    lfgBoardQueryOptions(user, noLfgFilters),
  );
  const posts = (board?.pages[0]?.edges ?? [])
    .map(({ node }) => node)
    .filter(({ author }) => author.id !== user?.id)
    .slice(0, LFG_TAB_POSTS);
  const pendingCount = myPost?.pendingCount ?? 0;

  return (
    <div className="flex flex-col">
      <LinkRow href={getLfgUrl()} icon={<SignalIcon />} label="Board" />
      {myPost ? (
        <LinkRow
          href={getLfgUrl(myPost.id)}
          icon={<SignalIcon secondary />}
          label="Your post"
          count={pendingCount}
          meta={
            pendingCount ? undefined : `${lfgDaysLeft(myPost.expiresAt)}d left`
          }
        />
      ) : (
        <LinkRow href={lfgNewPostUrl} icon={<PlusIcon />} label="New post" />
      )}
      <button
        type="button"
        className={rowClassName}
        onClick={() => openHelper(Origin.LfgMessages)}
      >
        <RowContent
          icon={<VolunteeringIcon secondary={!!helper} />}
          label="Open to helping"
          meta={helper ? 'On' : 'Off'}
        />
      </button>
      {posts.length > 0 && (
        <section className="mt-2 flex flex-col border-t border-border-subtlest-tertiary px-4 pt-3">
          <div className="flex items-center justify-between gap-2">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Callout}
              bold
            >
              Looking for a group now
            </Typography>
            <Link href={getLfgUrl()} passHref>
              <a
                href={getLfgUrl()}
                className="font-bold text-text-link typo-footnote hover:underline"
              >
                See all
              </a>
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
            {posts.map((post, index) => (
              <LfgRow
                key={post.id}
                post={post}
                viewerId={user?.id}
                onOpen={() =>
                  logEvent({
                    event_name: LogEvent.ClickLfgPost,
                    target_type: TargetType.LfgPost,
                    target_id: post.id,
                    extra: JSON.stringify({
                      origin: Origin.LfgMessages,
                      kind: post.kind,
                      position: index,
                    }),
                  })
                }
                onReachOut={() => openReachOut(post, Origin.LfgMessages)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
