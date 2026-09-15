import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Actions,
  Avatar,
  EngagementMeta,
  Facepile,
  FeaturedHero,
  Frame,
  Logo,
  MetaLine,
  Name,
  SectionTitle,
  Viewer,
} from './kit';
import type { Entry } from './data';
import {
  entriesByMonth,
  formatCount,
  formatDay,
  formatSince,
  latestEntry,
  squad,
  team,
} from './data';

// Direction C: Publication. Substack, the Linear and Vercel changelogs, and
// the restraint of Whoop. Centred, one column, the cover used as light behind
// the masthead rather than as a banner. The content is presented as a dated
// timeline because for this squad the content is a changelog. The identity
// strip is deliberately quiet: the team's faces and the posts are the brand.

const TimelineEntry = ({
  entry,
  first,
}: {
  entry: Entry;
  first: boolean;
}): ReactElement => (
  <article
    className={classNames(
      'sq-press group relative grid cursor-pointer gap-6 py-5',
      !first && 'border-t border-border-subtlest-tertiary',
    )}
    style={{ gridTemplateColumns: '7.5rem 1.25rem minmax(0, 1fr)' }}
  >
    <time className="sq-nums pt-0.5 text-right text-text-tertiary typo-footnote">
      {formatDay(entry.createdAt)}
    </time>
    <span className="relative flex justify-center pt-1.5">
      <span className="sq-ring h-2 w-2 rounded-full bg-text-quaternary transition-colors group-hover:bg-accent-cabbage-default" />
    </span>
    <div className="flex gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="font-bold text-text-primary typo-title4">
          {entry.title}
        </h3>
        <p className="line-clamp-2 text-text-secondary typo-callout">
          {entry.summary}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <Avatar member={entry.author} size={1.25} />
          <span className="text-text-tertiary typo-footnote">
            {entry.author.name}
          </span>
          <EngagementMeta entry={entry} className="ml-3" />
        </div>
      </div>
      {entry.image && (
        <img
          src={entry.image}
          alt=""
          className="h-[5.5rem] w-[9rem] shrink-0 rounded-12 object-cover"
        />
      )}
    </div>
  </article>
);

export const LayoutPublication = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => (
  <Frame>
    <div className="relative overflow-hidden">
      <div
        className="sq-backdrop"
        style={{ backgroundImage: `url(${squad.headerImage})` }}
      />
      <header className="relative mx-auto flex w-full max-w-[52rem] flex-col items-center gap-5 px-6 pb-10 pt-14 text-center">
        <Logo size={5.5} ring={false} className="sq-elevated" />
        <div className="flex flex-col items-center gap-2">
          <Name size="mega3" />
          <p className="max-w-[46ch] text-text-secondary typo-body">
            {squad.tagline}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Facepile members={team} max={5} size={1.75} />
          <span className="text-text-tertiary typo-footnote">
            Written by the daily.dev team
          </span>
        </div>
        <Actions viewer={viewer} size={ButtonSize.Medium} />
        <MetaLine
          className="text-text-quaternary"
          items={[
            <span key="m">
              <b className="sq-nums font-bold text-text-secondary">
                {formatCount(squad.membersCount)}
              </b>{' '}
              members
            </span>,
            <span key="p">
              <b className="sq-nums font-bold text-text-secondary">
                {squad.totalPosts}
              </b>{' '}
              releases
            </span>,
            <span key="v">
              <b className="sq-nums font-bold text-text-secondary">
                {formatCount(squad.totalViews)}
              </b>{' '}
              views
            </span>,
            `Since ${formatSince(squad.createdAt)}`,
          ]}
        />
      </header>
    </div>
    <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-10 px-6 pb-16">
      <FeaturedHero entry={latestEntry} eyebrow="Latest release" />
      <section className="flex flex-col gap-2">
        <SectionTitle
          title="All updates"
          action={
            <div className="flex items-center gap-4 text-text-tertiary typo-footnote">
              <span className="font-bold text-text-primary">Timeline</span>
              <span>Cards</span>
            </div>
          }
        />
        <div className="sq-timeline-rail relative">
          {entriesByMonth.map((group) => (
            <div key={group.month} className="relative">
              <div
                className="grid pt-6"
                style={{ gridTemplateColumns: '7.5rem 1.25rem minmax(0, 1fr)' }}
              >
                <span className="whitespace-nowrap pr-2 text-right font-bold uppercase tracking-wide text-text-quaternary typo-caption1">
                  {group.month}
                </span>
              </div>
              {group.items.map((entry, index) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  first={index === 0}
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  </Frame>
);
