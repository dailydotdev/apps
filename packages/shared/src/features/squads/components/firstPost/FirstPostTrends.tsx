import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type {
  DeveloperTrends,
  DeveloperTrendsTopic,
} from '../../../../graphql/squadIntel';
import {
  startupsLavender,
  startupsLavenderWash,
} from '../../../../styles/custom';
import { getIntelWeekLabel } from '../../lib/intel';
import { StartupsFreeChip } from '../StartupsFreeChip';
import { TagChips } from './FirstPostIntelSections';
import { IntelPostRow } from './IntelPostRow';
import { IntelTag, IntelText } from './IntelTag';
import { formatMultiple, IntelBar, IntelSection } from './IntelSection';

interface FirstPostTrendsProps {
  trends: DeveloperTrends;
  upgradeUrl?: string;
  onUpgrade?: () => void;
}

type Example = DeveloperTrends['examples'][number];

const sentence = (text: string): string =>
  `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/** Two decimals below 1, where 0.16 and 0.24 tell apart */
const supplyMultiple = (value: number): string =>
  value < 1 ? `${value.toFixed(2)}×` : formatMultiple(value);

/** Rising topics with a bar by how far each rose, and what drove it */
const RisingRows = ({
  topics,
}: {
  topics: DeveloperTrendsTopic[];
}): ReactElement => {
  const max = Math.max(...topics.map(({ multiple }) => multiple - 1));

  return (
    <ul className="flex flex-col gap-3">
      {topics.map(({ tag, multiple, note }) => (
        <li key={tag} className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <IntelTag
              tag={tag}
              className="w-28 shrink-0 truncate font-bold typo-footnote tablet:w-40"
            />
            <IntelBar
              percentage={max > 0 ? ((multiple - 1) / max) * 100 : 0}
              fillClassName="bg-accent-avocado-default"
            />
            <span className="w-10 shrink-0 text-right font-bold tabular-nums typo-footnote">
              {formatMultiple(multiple)}
            </span>
          </div>
          {note && (
            <p className="text-pretty text-text-tertiary typo-caption1">
              <IntelText text={sentence(note)} />
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};

const FORMAT_COLUMNS = ['bookmarks', 'upvotes', 'comments'] as const;

/** A post that worked, as the intel's post row, with why it got read */
const ExampleRow = ({
  example,
  rank,
}: {
  example: Example;
  rank?: number;
}): ReactElement => (
  <IntelPostRow
    post={{
      title: example.title || sentence(example.pattern),
      source: example.source ?? '',
      permalink: example.url ?? '',
      image: example.image,
      upvotes: example.upvotes,
      comments: example.comments,
    }}
    rank={rank}
  >
    {example.note && (
      <span className="text-pretty text-text-tertiary typo-footnote">
        {sentence(example.note)}
      </span>
    )}
  </IntelPostRow>
);

/**
 * What a company page without a plan reads once its one week of intel ends:
 * the weekly trends across daily.dev, the same for every free page.
 */
export const FirstPostTrends = ({
  trends,
  upgradeUrl,
  onUpgrade,
}: FirstPostTrendsProps): ReactElement => {
  const rising = trends.risingTopics.filter(({ broad }) => broad !== false);
  const oneStory = trends.risingTopics.filter(({ broad }) => broad === false);
  const worked = trends.examples.filter(
    ({ counterExample }) => !counterExample,
  );
  const counter = trends.examples.find(({ counterExample }) => counterExample);
  const maxReads = Math.max(...trends.formats.map(({ reads }) => reads), 1);
  const chips = (topics: { tag: string; multiple: number }[]) =>
    topics.map(({ tag, multiple }) => ({
      tag,
      detail: supplyMultiple(multiple),
    }));

  return (
    <div className="flex flex-col gap-8 px-4 py-6 tablet:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-bold typo-title3">
              What developers read last week
            </h3>
            <StartupsFreeChip />
            {upgradeUrl && (
              <a
                href={upgradeUrl}
                onClick={onUpgrade}
                className="ml-auto flex items-center gap-1 font-bold text-text-primary typo-footnote hover:underline"
              >
                Get intel on your own topics
                <MoveToIcon size={IconSize.Size16} className="shrink-0" />
              </a>
            )}
          </div>
          <p className="text-pretty text-text-tertiary typo-footnote">
            {`Across all of daily.dev, ${getIntelWeekLabel(trends)}, against the 4 weeks before. Every company page gets this each week.`}
          </p>
        </div>
        {trends.summary && (
          <p
            className="text-pretty border-l-2 py-1 pl-4 text-text-secondary typo-callout"
            style={{ borderColor: startupsLavender }}
          >
            <IntelText text={trends.summary} />
          </p>
        )}
      </div>

      {!!rising.length && (
        <IntelSection
          title="Rising, and why"
          hint="Topics read more than in a usual week, and the posts behind it."
        >
          <RisingRows topics={rising} />
          {!!oneStory.length && (
            <p className="text-pretty text-text-secondary typo-footnote">
              <IntelText
                text={`A single story drove ${oneStory
                  .map(
                    ({ tag, multiple }) =>
                      `#${tag} (${formatMultiple(multiple)})`,
                  )
                  .join(', ')}, so they may not last.`}
              />
            </p>
          )}
        </IntelSection>
      )}

      {!!trends.coolingTopics.length && (
        <IntelSection
          title="Cooling"
          hint="Topics read less than in a usual week."
        >
          <TagChips tags={chips(trends.coolingTopics)} />
        </IntelSection>
      )}

      {(!!trends.underserved.length || !!trends.crowded.length) && (
        <IntelSection
          title="Where a new post gets read"
          hint="Reads per new post last week, against the average topic."
        >
          {!!trends.underserved.length && (
            <div className="flex flex-col gap-2">
              <h4 className="font-bold typo-footnote">
                Few posts for the readers
              </h4>
              <TagChips tags={chips(trends.underserved)} />
            </div>
          )}
          {!!trends.crowded.length && (
            <div className="flex flex-col gap-2">
              <h4 className="font-bold typo-footnote">
                Many posts splitting the reads
              </h4>
              <TagChips tags={chips(trends.crowded)} />
            </div>
          )}
        </IntelSection>
      )}

      {!!trends.formats.length && (
        <IntelSection
          title="What gets read"
          hint="Per time a post was shown, against the average post. Green is above average."
        >
          <div className="flex flex-col gap-2.5">
            <div className="hidden items-center gap-3 text-text-quaternary typo-caption2 tablet:flex">
              <span className="w-44 shrink-0">Format</span>
              <span className="min-w-0 flex-1">Reads</span>
              <span className="w-10 shrink-0" />
              <span className="w-16 shrink-0 text-right">Bookmarks</span>
              <span className="w-14 shrink-0 text-right">Upvotes</span>
              <span className="w-16 shrink-0 text-right">Comments</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {trends.formats.map((format) => (
                <li key={format.format} className="flex items-center gap-3">
                  <span className="line-clamp-2 w-32 shrink-0 typo-footnote tablet:w-44">
                    {sentence(format.format)}
                  </span>
                  <IntelBar
                    percentage={(format.reads / maxReads) * 100}
                    fillClassName={
                      format.reads >= 1
                        ? 'bg-accent-avocado-default'
                        : 'bg-text-quaternary'
                    }
                  />
                  <span className="w-10 shrink-0 text-right font-bold tabular-nums typo-footnote">
                    {formatMultiple(format.reads)}
                  </span>
                  {FORMAT_COLUMNS.map((column) => (
                    <span
                      key={column}
                      className={classNames(
                        'hidden shrink-0 text-right tabular-nums typo-footnote tablet:block',
                        column === 'upvotes' ? 'w-14' : 'w-16',
                        format[column] >= 1
                          ? 'text-text-primary'
                          : 'text-text-tertiary',
                      )}
                    >
                      {formatMultiple(format[column])}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </IntelSection>
      )}

      {!!worked.length && (
        <IntelSection
          title="Posts that worked"
          hint="How they did, and why they got read."
        >
          <ol className="flex flex-col">
            {worked.map((example, index) => (
              <ExampleRow
                key={example.pattern}
                example={example}
                rank={index + 1}
              />
            ))}
          </ol>
          {counter && (
            <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4">
              <h4 className="font-bold text-text-tertiary typo-footnote">
                One that didn&apos;t
              </h4>
              <ul className="flex flex-col">
                <ExampleRow example={counter} />
              </ul>
            </div>
          )}
        </IntelSection>
      )}

      {upgradeUrl && (
        <div
          className="flex flex-col gap-3 rounded-16 p-4 tablet:flex-row tablet:items-center tablet:p-5"
          style={{ background: startupsLavenderWash }}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="font-bold typo-body">
              Get intel on your own topics
            </h3>
            <p className="text-pretty text-text-secondary typo-footnote">
              The Startup plan sends intel every week on the topics you pick:
              what your audience reads, the titles and formats that get read
              there, and what they bookmark and discuss.
            </p>
          </div>
          <Button
            tag="a"
            href={upgradeUrl}
            onClick={onUpgrade}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="shrink-0 self-start tablet:self-center"
          >
            See the Startup plan
          </Button>
        </div>
      )}
    </div>
  );
};
