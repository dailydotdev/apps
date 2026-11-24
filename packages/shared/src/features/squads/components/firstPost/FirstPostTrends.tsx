import type { ReactElement } from 'react';
import React from 'react';
import { MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import type {
  DeveloperTrends,
  DeveloperTrendsTopic,
} from '../../../../graphql/squadIntel';
import { getIntelWeekLabel } from '../../lib/intel';
import { StartupsFreeChip } from '../StartupsFreeChip';
import { formatMultiple, IntelBar, IntelSection } from './FirstPostIntel';

interface FirstPostTrendsProps {
  trends: DeveloperTrends;
  upgradeUrl?: string;
  onUpgrade?: () => void;
}

/** Bars by how far each topic moved from a usual week, up or down */
const TopicRows = ({
  topics,
}: {
  topics: DeveloperTrendsTopic[];
}): ReactElement => {
  const moved = (multiple: number) =>
    multiple >= 1 ? multiple - 1 : 1 - multiple;
  const max = Math.max(...topics.map(({ multiple }) => moved(multiple)));

  return (
    <ul className="flex flex-col gap-2.5">
      {topics.map(({ tag, multiple, broad }) => (
        <li key={tag} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate typo-footnote tablet:w-44">
            #{tag}
          </span>
          <IntelBar percentage={max ? (moved(multiple) / max) * 100 : 0} />
          <span className="w-10 shrink-0 text-right font-bold tabular-nums typo-footnote">
            {formatMultiple(multiple)}
          </span>
          <span className="hidden w-24 shrink-0 text-right text-text-tertiary typo-footnote tablet:block">
            {broad === false ? 'one story' : ''}
          </span>
        </li>
      ))}
    </ul>
  );
};

/**
 * What a company page without a plan reads once its one trial intel ends:
 * the weekly trends across daily.dev, the same for every free page.
 */
export const FirstPostTrends = ({
  trends,
  upgradeUrl,
  onUpgrade,
}: FirstPostTrendsProps): ReactElement => {
  const maxReads = Math.max(...trends.formats.map(({ reads }) => reads), 1);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 tablet:px-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-bold typo-title3">This week</h3>
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
          {`What developers read across daily.dev, week of ${getIntelWeekLabel(trends)}. The Startup plan sends intel on the topics you pick every week.`}
        </p>
      </div>

      {!!trends.risingTopics.length && (
        <IntelSection
          title="Rising"
          hint="Topics read more than in a usual week."
        >
          <TopicRows topics={trends.risingTopics} />
        </IntelSection>
      )}

      {!!trends.coolingTopics.length && (
        <IntelSection
          title="Cooling"
          hint="Topics read less than in a usual week."
        >
          <TopicRows topics={trends.coolingTopics} />
        </IntelSection>
      )}

      {!!trends.formats.length && (
        <IntelSection
          title="What gets read"
          hint="Reads per time a post was shown, against the average post."
        >
          <ul className="flex flex-col gap-2.5">
            {trends.formats.map(({ format, reads }) => (
              <li key={format} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate typo-footnote tablet:w-44">
                  {format}
                </span>
                <IntelBar percentage={(reads / maxReads) * 100} />
                <span className="w-10 shrink-0 text-right font-bold tabular-nums typo-footnote">
                  {formatMultiple(reads)}
                </span>
              </li>
            ))}
          </ul>
        </IntelSection>
      )}
    </div>
  );
};
