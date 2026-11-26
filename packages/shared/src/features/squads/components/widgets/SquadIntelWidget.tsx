import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { useAuthContext } from '../../../../contexts/AuthContext';
import {
  developerTrendsQueryOptions,
  squadIntelHighlightsQueryOptions,
} from '../../../../graphql/squadIntel';
import { LogEvent, Origin } from '../../../../lib/log';
import { startupsLavender } from '../../../../styles/custom';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import {
  formatIntelIndex,
  getIntelOpening,
  getIntelWeekLabel,
} from '../../lib/intel';
import { useLogStartups } from '../../hooks/useLogStartups';
import { isStaffViewer } from '../../lib/viewer';
import { isCompanyPage } from '../../lib/companyPage';
import { IntelTag } from '../firstPost/IntelTag';
import { formatMultiple } from '../firstPost/IntelSection';

const TOPICS_SHOWN = 2;

/**
 * The page's weekly intel at a glance, in the side column of its admins: the
 * topic to write about and the busiest topics, or the rising topics across
 * daily.dev while it has no intel. The whole intel opens from it.
 */
export const SquadIntelWidget = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown, setIntelOpen } = useSquadPageContext();
  const { user } = useAuthContext();
  const isShown =
    isViewerKnown && isStaffViewer(viewer) && isCompanyPage(squad);
  const sourceId = getSquadId(squad);
  const { data: intel, isFetched: isIntelFetched } = useQuery(
    squadIntelHighlightsQueryOptions({
      user,
      sourceId,
      createdAt: squad.createdAt,
      enabled: isShown,
    }),
  );
  const { data: trends } = useQuery(
    developerTrendsQueryOptions({
      user,
      enabled: isShown && isIntelFetched && !intel,
    }),
  );
  const logStartups = useLogStartups();

  const week = intel ?? trends;

  if (!isShown || !week) {
    return null;
  }

  const opening = intel && getIntelOpening(intel.topics);
  const rising =
    trends?.risingTopics.filter(({ broad }) => broad !== false) ?? [];

  return (
    <section className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex items-center justify-between gap-2 typo-caption1">
        <span
          className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 font-bold"
          style={{ color: startupsLavender }}
        >
          {intel ? 'Weekly intel' : 'Developer trends'}
        </span>
        <span className="text-text-tertiary">
          {intel?.trial ? 'Your free issue' : getIntelWeekLabel(week)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <h2 className="font-bold typo-callout">
          {opening ? (
            <>
              <IntelTag tag={opening.tag} /> is your opening
            </>
          ) : (
            'What developers read last week'
          )}
        </h2>
        {opening && (
          <p className="text-text-tertiary typo-footnote">
            {`Posts there get ${formatIntelIndex(opening.readsPerPost)} the average reads, and few new posts compete for them.`}
          </p>
        )}
      </div>
      <ul className="flex flex-col">
        {!intel &&
          rising.slice(0, TOPICS_SHOWN).map(({ tag, multiple }) => (
            <li
              key={tag}
              className="flex h-8 items-center gap-2 border-t border-border-subtlest-tertiary typo-footnote"
            >
              <IntelTag
                tag={tag}
                className="min-w-0 flex-1 truncate font-bold"
              />
              <span className="font-bold tabular-nums text-accent-avocado-default">
                {`${formatMultiple(multiple)} reads`}
              </span>
            </li>
          ))}
        {intel?.topics.slice(0, TOPICS_SHOWN).map(({ tag, share, change }) => (
          <li
            key={tag}
            className="flex h-8 items-center gap-2 border-t border-border-subtlest-tertiary typo-footnote"
          >
            <IntelTag tag={tag} className="min-w-0 flex-1 truncate font-bold" />
            <span className="tabular-nums text-text-tertiary">{`${share}% of reads`}</span>
            <span
              className={classNames(
                'w-10 text-right font-bold tabular-nums',
                change === null || change > 0
                  ? 'text-accent-avocado-default'
                  : 'text-text-tertiary',
              )}
            >
              {change === null ? 'new' : `${change > 0 ? '+' : ''}${change}%`}
            </span>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        className="w-full"
        onClick={() => {
          logStartups(LogEvent.ClickStartupsSetupStep, 'intel widget', {
            origin: Origin.SquadPage,
            source_id: sourceId,
          });
          setIntelOpen(true);
        }}
      >
        {intel ? 'Open the full intel' : 'Open the trends'}
      </Button>
    </section>
  );
};
