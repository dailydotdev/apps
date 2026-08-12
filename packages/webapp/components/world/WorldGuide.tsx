import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldDistrict } from '../../graphql/world';
import { LEVELS, levelOf } from './ladder';

/* The four numbers the rail puts on one line, defined in the order they stand
   in. The level badge used to be defined here with them, as a fifth row reading
   "L1-L12: how built up a district is"; it has a section of its own above now,
   because a range and an adjective is not what somebody looking at "L7" needs
   to know. */
const STAT_INFO: [string, string][] = [
  ['Articles', 'every article read on daily.dev'],
  ['Districts', 'one per topic read at least once'],
  ['Realms', 'districts that share a subject'],
  ['Active', 'first article read to last'],
];

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <Typography
      tag={TypographyTag.H2}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      bold
    >
      {title}
    </Typography>
    {children}
  </section>
);

const Line = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.P}
    type={TypographyType.Caption1}
    color={TypographyColor.Tertiary}
  >
    {children}
  </Typography>
);

/* A term and what it means, which is the shape of nearly everything in here:
   the stat definitions, and the list of what a click does. */
const Term = ({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}): ReactElement => (
  <li className="typo-caption1">
    <b className="text-text-primary">{term}</b>
    <span className="text-text-tertiary"> {children}</span>
  </li>
);

interface WorldGuideProps {
  isOwn: boolean;
  districts?: WorldDistrict[];
  /** No replay on bare ground and none on a handheld, so it is not promised. */
  hasReplay?: boolean;
  /** Only the owner has a bench to be pointed at. */
  canCustomize?: boolean;
  onClose: () => void;
}

/**
 * What this place is, how it grows, and what the things on it do.
 *
 * It replaces the rail rather than opening over the world, the same way the
 * bench does: the one thing a reader is here to look at is the world, and an
 * explanation of a map that covers the map is answering the question by taking
 * away the reason to ask it.
 *
 * The ladder is the whole of the mechanic and the one part of it that was never
 * written down anywhere a reader could reach: the rungs were dev-facing, and all
 * anyone ever saw was "L7" with nothing to measure it against. Twelve
 * thresholds and a mark on the one this world is standing on is the shortest
 * honest answer.
 */
export function WorldGuide({
  isOwn,
  districts,
  hasReplay,
  canCustomize,
  onClose,
}: WorldGuideProps): ReactElement {
  /* Off the districts rather than the rank rows, which hold REALMS at world
     scale and are scored on the stretched ladder. The level anyone is ever shown
     is a district's, so the one marked here has to be too. */
  const topLevel =
    districts?.reduce((top, { reads }) => Math.max(top, levelOf(reads)), 0) ??
    0;

  return (
    <aside
      data-world-overlay
      className="pointer-events-auto absolute inset-y-0 left-0 z-1 flex w-80 flex-col gap-4 overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default p-4"
    >
      <header className="flex items-center justify-between gap-2">
        <Typography type={TypographyType.Body} bold>
          How this world works
        </Typography>
        <CloseButton
          type="button"
          size={ButtonSize.Small}
          aria-label="Close the guide"
          onClick={onClose}
        />
      </header>

      <Section title="What this is">
        <Line>
          Every article {isOwn ? 'you read' : 'they read'} on daily.dev grows a
          district here. Reading is the only thing that builds it.
        </Line>
      </Section>

      <Section title="How it grows">
        <Line>
          Every topic read becomes a district, and the more articles in it, the
          more it builds up. Each of the twelve levels needs twice as many
          articles as the one below, so the first few come fast and the last
          ones stay out of reach.
        </Line>
        {/* Twelve thresholds, wrapped three to a row. The one this world is
            standing on is filled in, so the ladder is read against something
            rather than in the abstract. */}
        <ul aria-label="Levels" className="grid grid-cols-3 gap-1">
          {LEVELS.map(({ reads }, index) => {
            const level = index + 1;
            const isTop = level === topLevel;

            return (
              <li
                key={reads}
                className={classNames(
                  'flex items-baseline justify-between gap-1 rounded-8 border border-border-subtlest-tertiary px-2 py-1',
                  isTop && 'bg-surface-float',
                )}
              >
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  color={isTop ? undefined : TypographyColor.Quaternary}
                  bold={isTop}
                >
                  L{level}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  color={
                    isTop
                      ? TypographyColor.Secondary
                      : TypographyColor.Quaternary
                  }
                  className="tabular-nums"
                >
                  {reads.toLocaleString()}
                </Typography>
              </li>
            );
          })}
        </ul>
        {topLevel > 0 && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            {isOwn ? 'Your' : 'Their'} busiest district is L{topLevel}.
          </Typography>
        )}
      </Section>

      <Section title="What you can do here">
        <ul className="flex flex-col gap-1">
          <Term term="Click a realm">to go inside and see its districts.</Term>
          <Term term="Click a district">
            to read the posts {isOwn ? 'you' : 'they'} upvoted there.
          </Term>
          {/* The one interaction on the world with no permanent sign that it
              exists: birds only announce themselves once the pointer is already
              on one, and nothing leads a pointer there. */}
          <Term term="Click a bird">
            to ride it. They circle the bigger districts.
          </Term>
          <Term term="Drag and scroll">to move around the map and zoom.</Term>
          {!!hasReplay && (
            <Term term="Play the bar below">
              to watch the world grow from the first article to today.
            </Term>
          )}
          {!!canCustomize && (
            <Term term="Make it yours">
              to name the place and change its crest, sky and colours. None of
              that builds land.
            </Term>
          )}
        </ul>
      </Section>

      <Section title="The numbers">
        <ul className="flex flex-col gap-1">
          {STAT_INFO.map(([term, meaning]) => (
            <Term key={term} term={`${term}:`}>
              {meaning}
            </Term>
          ))}
        </ul>
      </Section>
    </aside>
  );
}
