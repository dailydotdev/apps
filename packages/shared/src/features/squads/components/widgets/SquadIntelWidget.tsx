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
import { squadIntelHighlightsQueryOptions } from '../../../../graphql/squadIntel';
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
import { useIsFirstPostShown } from '../firstPost/SquadFirstPost';

const TOPICS_SHOWN = 2;

/**
 * The page's weekly intel at a glance, in the side column: the topic to
 * write about and the busiest topics. The whole intel opens from it.
 */
export const SquadIntelWidget = (): ReactElement | null => {
  const { squad, setIntelOpen } = useSquadPageContext();
  const { user } = useAuthContext();
  const isShown = useIsFirstPostShown();
  const sourceId = getSquadId(squad);
  const { data: intel } = useQuery(
    squadIntelHighlightsQueryOptions({ user, sourceId, enabled: isShown }),
  );
  const logStartups = useLogStartups();

  if (!isShown || !intel) {
    return null;
  }

  const opening = getIntelOpening(intel.topics);

  return (
    <section className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <div className="flex items-center justify-between gap-2 typo-caption1">
        <span
          className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 font-bold"
          style={{ color: startupsLavender }}
        >
          Weekly intel
        </span>
        <span className="text-text-tertiary">
          {intel.trial ? 'Your free issue' : getIntelWeekLabel(intel)}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <h2 className="font-bold typo-callout">
          {opening
            ? `Write about #${opening.tag}`
            : 'What developers read last week'}
        </h2>
        {opening && (
          <p className="text-text-tertiary typo-footnote">
            {`Posts there get ${formatIntelIndex(opening.readsPerPost)} the average reads, and few new posts compete for them.`}
          </p>
        )}
      </div>
      <ul className="flex flex-col">
        {intel.topics.slice(0, TOPICS_SHOWN).map(({ tag, share, change }) => (
          <li
            key={tag}
            className="flex h-8 items-center gap-2 border-t border-border-subtlest-tertiary typo-footnote"
          >
            <span className="min-w-0 flex-1 truncate font-bold">#{tag}</span>
            <span className="tabular-nums text-text-tertiary">{`${share}% of reads`}</span>
            <span
              className={classNames(
                'w-10 text-right font-bold tabular-nums',
                change > 0
                  ? 'text-accent-avocado-default'
                  : 'text-text-tertiary',
              )}
            >
              {`${change > 0 ? '+' : ''}${change}%`}
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
        Open the full intel
      </Button>
    </section>
  );
};
