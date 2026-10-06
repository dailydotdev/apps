import type { ReactElement } from 'react';
import React, { createContext, useContext, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DiscussIcon,
  MegaphoneIcon,
  PlusIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { entriesByMonth, formatDay, polls, squad, team } from '../data';
import { Avatar, isAdmin, isJoined, isStaff, Viewer } from '../kit';
import { PollList } from '@dailydotdev/shared/src/components/cards/poll/PollList';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { ContentSource, useWorkspace } from '../state';
import { cardHandlers, Column, hidden, toPollPost } from '../workspace';

// The Releases and Polls chips' pages, from before the feed dropped its
// chips. Only the archived Navigation picks render them.

/**
 * The changelog as a log, not a feed: GitHub Releases' shape. Every post
 * flaired as a release lands here grouped by month, newest first, with the
 * kind as a filter. The Announcements channel is where they are discussed;
 * this is where they are found.
 */
export const ReleasesPage = ({
  viewer,
  bare,
}: {
  viewer: Viewer;
  bare?: boolean;
}): ReactElement => {
  const { source, empty } = useWorkspace();

  return (
    <Column width="max-w-[52rem]" bare={bare} className="gap-6">
      {source === ContentSource.Feed && (
        <div className="flex items-center gap-3 rounded-12 bg-surface-float px-4 py-2.5 text-text-tertiary typo-footnote">
          <MegaphoneIcon size={IconSize.Small} />
          <span className="min-w-0 flex-1">
            Published from the company&apos;s feed,{' '}
            <span className="break-all text-text-secondary">
              {squad.feedUrl}
            </span>
            . Every item becomes a post here the hour it goes live.
          </span>
          <span className="sq-nums hidden shrink-0 text-text-quaternary typo-caption1 tablet:inline">
            Synced 2h ago
          </span>
        </div>
      )}
      {empty && (
        <div className="flex flex-col items-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary px-6 py-12 text-center">
          <span className="font-bold text-text-primary typo-callout">
            No releases yet
          </span>
          <span className="max-w-[40ch] text-text-tertiary typo-footnote">
            {source === ContentSource.Feed
              ? 'The feed is connected. The first item lands here the hour it is published.'
              : 'Post the first release and it starts the log.'}
          </span>
        </div>
      )}
      {((isStaff(viewer) && source === ContentSource.Manual) ||
        (isAdmin(viewer) && source === ContentSource.Feed)) && (
        <div className="flex justify-end">
          {source === ContentSource.Manual ? (
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
            >
              New release
            </Button>
          ) : (
            <Button variant={ButtonVariant.Subtle} size={ButtonSize.Small}>
              Feed settings
            </Button>
          )}
        </div>
      )}
      <ol className={classNames('flex flex-col gap-6', empty && 'hidden')}>
        {entriesByMonth
          .flatMap((group) => group.items)
          .map((entry) => (
            <li key={entry.id} className="group flex gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-bold text-text-primary typo-callout">
                  {entry.title}
                </span>
                <p className="line-clamp-2 text-text-secondary typo-footnote">
                  {entry.summary}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-quaternary typo-caption1">
                  <time className="sq-nums">{formatDay(entry.createdAt)}</time>
                  <span className="flex items-center gap-1.5">
                    <Avatar member={entry.author} size={1} />
                    {entry.author.name}
                  </span>
                  <span className="sq-nums flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <UpvoteIcon size={IconSize.XSmall} />
                      {entry.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <DiscussIcon size={IconSize.XSmall} />
                      {entry.comments}
                    </span>
                  </span>
                </div>
              </div>
              {entry.image && (
                <img
                  src={entry.image}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded-12 object-cover tablet:h-20 tablet:w-32"
                />
              )}
            </li>
          ))}
      </ol>
    </Column>
  );
};

/**
 * Polls, on the production poll card. The company asks, members vote in
 * place, the card flips to its results. The click is caught before the
 * card's own vote mutation so the story stays offline.
 */
export const PollsPage = ({
  viewer,
  bare,
}: {
  viewer: Viewer;
  bare?: boolean;
}): ReactElement => {
  const [votes, setVotes] = useState<Record<string, number>>({});

  return (
    <Column bare={bare} className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="min-w-0 flex-1 basis-56 text-text-tertiary typo-footnote">
          What the team wants to know from you. One vote each, results when you
          vote.
        </span>
        {isStaff(viewer) ? (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New poll
          </Button>
        ) : (
          <span className="sq-nums shrink-0 text-text-quaternary typo-caption1">
            {polls.length} open
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {polls.map((poll) => {
          const picked = votes[poll.id];

          return (
            <div
              key={poll.id}
              onClickCapture={(event) => {
                if (picked !== undefined || !isJoined(viewer)) {
                  return;
                }
                const option = (event.target as HTMLElement)
                  .closest('button')
                  ?.textContent?.trim();
                const index = poll.options.indexOf(option ?? '');
                if (index === -1) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                setVotes((current) => ({ ...current, [poll.id]: index }));
              }}
            >
              <PollList post={toPollPost(poll, picked)} {...cardHandlers} />
            </div>
          );
        })}
      </div>
    </Column>
  );
};
