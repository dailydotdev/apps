import type { ReactElement } from 'react';
import React from 'react';
import { SquadWidget } from '../widgets/SquadWidget';

export interface DeveloperTrendsTopic {
  tag: string;
  multiple: number;
}

interface DeveloperTrendsWidgetProps {
  /** "Nov 9 to Nov 15" */
  weekLabel: string;
  topics: DeveloperTrendsTopic[];
  /** One line on what kind of post worked that week */
  tip?: string | null;
  reportUrl: string;
  /** Set on the free plan: the line that sells intel on your own topics */
  upsell?: string;
}

const formatMultiple = (multiple: number): string => `${multiple.toFixed(1)}x`;

/** The week's developer trends, free for every company page */
export const DeveloperTrendsWidget = ({
  weekLabel,
  topics,
  tip,
  reportUrl,
  upsell,
}: DeveloperTrendsWidgetProps): ReactElement => (
  <SquadWidget title="This week on daily.dev">
    <p className="mt-0.5 text-text-tertiary typo-caption1">
      {`What developers read more of, ${weekLabel}`}
    </p>
    <ul className="mt-3 flex flex-col">
      {topics.map((topic) => (
        <li
          key={topic.tag}
          className="flex items-center justify-between border-b border-border-subtlest-tertiary py-2 typo-footnote last:border-b-0"
        >
          <span className="text-text-primary">{`#${topic.tag}`}</span>
          <span className="font-bold tabular-nums text-accent-avocado-default">
            {formatMultiple(topic.multiple)}
          </span>
        </li>
      ))}
    </ul>
    {tip && <p className="mt-2 text-text-secondary typo-footnote">{tip}</p>}
    <a
      href={reportUrl}
      className="mt-3 font-bold text-accent-cabbage-default typo-footnote"
    >
      Read this week&apos;s trends
    </a>
    {upsell && (
      <p className="mt-3 text-text-quaternary typo-caption1">{upsell}</p>
    )}
  </SquadWidget>
);
