import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SourceMode } from '../../policy/rank';
import { formatMultiplier } from '../FactorChips';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { Badge, PanelCard, PanelSection } from './Section';

const SourceRow = ({ source }: { source: Source }): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const entity = { id: source.id, name: source.name ?? source.id };
  const isBlocked = state.blockedSources.includes(source.id);
  const isDemoted = state.sourceControls[source.id] === SourceMode.Demoted;
  const onScreen = store.next.served.filter(
    ({ post }) => post.source?.id === source.id,
  ).length;
  let effect = formatMultiplier(state.params['follows.source_multiplier']);
  if (isDemoted) {
    effect = `${effect} × ${state.params['interests.control_demote'].toFixed(2)} for Less`;
  }

  return (
    <li className="flex flex-wrap items-center gap-3 p-3">
      <SourceAvatar
        source={source}
        size={ProfileImageSize.Medium}
        className="!mr-0"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="min-w-0 shrink truncate font-bold text-text-primary typo-callout">
            {source.name}
          </span>
          {isBlocked ? (
            <Badge className="bg-accent-ketchup-flat text-accent-ketchup-default">
              Blocked
            </Badge>
          ) : (
            <Badge className="bg-accent-water-flat text-accent-water-default">
              {effect}
            </Badge>
          )}
        </span>
        <span className="text-text-tertiary typo-caption1">
          {isBlocked
            ? 'None of its posts show.'
            : `Every post from it comes in. ${
                onScreen ? `${onScreen} in your next 12.` : ''
              }`}
        </span>
      </span>
      <span className="flex gap-2">
        {isBlocked ? (
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => store.setSourceBlocked(entity, false)}
          >
            Unblock
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              pressed={isDemoted}
              onClick={() =>
                store.setSourceMode(
                  entity,
                  isDemoted ? undefined : SourceMode.Demoted,
                )
              }
            >
              Less
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => store.setSourceFollowed(entity, false)}
            >
              Unfollow
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => store.setSourceBlocked(entity, true)}
            >
              Block
            </Button>
          </>
        )}
      </span>
    </li>
  );
};

export const SourcesSection = (): ReactElement => {
  const store = usePersonalization();
  const { state, pool } = store;
  const sourceById = useMemo(() => {
    const map = new Map<string, Source>();
    pool.forEach(({ source }) => {
      if (source?.id) {
        map.set(source.id, source as Source);
      }
    });
    return map;
  }, [pool]);
  const followed = state.followedSources
    .map((id) => sourceById.get(id))
    .filter((source): source is Source => !!source);
  const blocked = state.blockedSources
    .map((id) => sourceById.get(id))
    .filter((source): source is Source => !!source);
  const suggestions = useMemo(() => {
    const counts = new Map<string, number>();
    pool.forEach(({ source }) => {
      if (source?.id) {
        counts.set(source.id, (counts.get(source.id) ?? 0) + 1);
      }
    });
    return [...counts.entries()]
      .filter(
        ([id]) =>
          !state.followedSources.includes(id) &&
          !state.blockedSources.includes(id),
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => sourceById.get(id))
      .filter((source): source is Source => !!source);
  }, [pool, sourceById, state.followedSources, state.blockedSources]);

  return (
    <PanelSection
      section={ControlSection.Sources}
      title="Sources and people"
      description="Follows bring in every post and multiply its score; the bigger of a source or author follow applies. The feed doesn't learn sources from your reading yet, so only follows and blocks count here."
    >
      <PanelCard>
        <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
          {[...followed, ...blocked].map((source) => (
            <SourceRow key={source.id} source={source} />
          ))}
          {!followed.length && !blocked.length && (
            <li className="p-4 text-text-tertiary typo-footnote">
              You don&apos;t follow or block any source yet.
            </li>
          )}
          <li className="p-3 text-text-tertiary typo-footnote">
            {state.followedAuthors.length
              ? `${state.followedAuthors.length} people you follow, ${formatMultiplier(
                  state.params['follows.author_multiplier'],
                )} each.`
              : `No people followed. Following a writer multiplies their posts by ${formatMultiplier(
                  state.params['follows.author_multiplier'],
                )}.`}
          </li>
        </ul>
      </PanelCard>
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-text-tertiary typo-footnote">
            Sources in posts you could see, most common first.
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((source) => (
              <Button
                key={source.id}
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                onClick={() =>
                  store.setSourceFollowed(
                    { id: source.id, name: source.name ?? source.id },
                    true,
                  )
                }
              >
                {source.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </PanelSection>
  );
};
