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
import { formatParam, ParamFormat } from '../../policy/params';
import { SourceMode } from '../../policy/rank';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { BoostSlider } from '../controls';
import { EntityRow, PanelList, PanelListEmpty, PanelSection } from './Section';

type ListedSource = Source & { id: string };

const formatBoost = (value: number): string =>
  formatParam(ParamFormat.Multiplier, value);

const SourceRow = ({ source }: { source: ListedSource }): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const { params } = state;
  const entity = { id: source.id, name: source.name ?? source.id };
  const isFollowed = state.followedSources.includes(source.id);
  const isBlocked = state.blockedSources.includes(source.id);
  const media = (
    <SourceAvatar
      source={source}
      size={ProfileImageSize.Medium}
      className="!mr-0"
    />
  );

  if (isBlocked) {
    return (
      <EntityRow
        media={media}
        name={entity.name}
        isStruck
        action={
          <Button
            type="button"
            className="w-24"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => store.setSourceBlocked(entity, false)}
          >
            Unblock
          </Button>
        }
      />
    );
  }

  const automatic = isFollowed ? params['follows.source_multiplier'] : 1;
  const exact = state.sourceWeights?.[source.id];
  const isDemoted = state.sourceControls[source.id] === SourceMode.Demoted;
  const value =
    exact ?? automatic * (isDemoted ? params['interests.control_demote'] : 1);

  return (
    <EntityRow
      media={media}
      name={entity.name}
      description={
        isFollowed
          ? 'You follow this. Every post from it shows up.'
          : "You don't follow this. Its posts show up when they match your topics."
      }
      boost={
        <BoostSlider
          className="flex-1"
          label={`Boost for ${entity.name}`}
          value={value}
          min={0.25}
          max={3}
          step={0.05}
          display={formatBoost(value)}
          isSet={exact !== undefined || isDemoted}
          resetLabel={`Back to automatic (${formatBoost(automatic)})`}
          onChange={(next) => store.setSourceWeight(entity, next)}
          onReset={() => store.setSourceWeight(entity, undefined)}
        />
      }
      action={
        <Button
          type="button"
          className="w-24"
          variant={isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => store.setSourceFollowed(entity, !isFollowed)}
        >
          {isFollowed ? 'Unfollow' : 'Follow'}
        </Button>
      }
    />
  );
};

export const SourcesSection = (): ReactElement => {
  const store = usePersonalization();
  const { state, pool } = store;
  const sourceById = useMemo(() => {
    const map = new Map<string, ListedSource>();
    pool.forEach(({ source }) => {
      if (source?.id) {
        map.set(source.id, source as ListedSource);
      }
    });
    return map;
  }, [pool]);
  const authorById = useMemo(() => {
    const map = new Map<string, string>();
    pool.forEach(({ author }) => {
      if (author?.id) {
        map.set(author.id, author.name ?? author.id);
      }
    });
    return map;
  }, [pool]);
  const toSources = (ids: string[]) =>
    ids
      .map((id) => sourceById.get(id))
      .filter((source): source is ListedSource => !!source);
  const adjusted = [
    ...new Set([
      ...Object.keys(state.sourceControls),
      ...Object.keys(state.sourceWeights ?? {}),
    ]),
  ].filter(
    (id) =>
      !state.followedSources.includes(id) && !state.blockedSources.includes(id),
  );
  const listed = toSources([...state.followedSources, ...adjusted]);
  const blocked = toSources(state.blockedSources);
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
      .filter((source): source is ListedSource => !!source);
  }, [pool, sourceById, state.followedSources, state.blockedSources]);

  return (
    <PanelSection
      section={ControlSection.Sources}
      title="Sources and people"
      description="Every post from a source or person you follow shows up, with a boost you can change. Reading from a source doesn't add it here; only follows do."
    >
      <PanelList title="Sources you follow">
        {listed.map((source) => (
          <SourceRow key={source.id} source={source} />
        ))}
        {!listed.length && (
          <PanelListEmpty>
            You don&apos;t follow any sources yet.
          </PanelListEmpty>
        )}
      </PanelList>
      <PanelList title="People you follow">
        {state.followedAuthors.map((id) => {
          const author = { id, name: authorById.get(id) ?? id };
          return (
            <EntityRow
              key={id}
              media={null}
              name={author.name}
              description={`Every post they write shows up, ${formatBoost(
                state.params['follows.author_multiplier'],
              )}.`}
              action={
                <Button
                  type="button"
                  className="w-24"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Small}
                  onClick={() => store.setAuthorFollowed(author, false)}
                >
                  Unfollow
                </Button>
              }
            />
          );
        })}
        {!state.followedAuthors.length && (
          <PanelListEmpty>
            You don&apos;t follow anyone yet. Following a writer shows you every
            post they write.
          </PanelListEmpty>
        )}
      </PanelList>
      {blocked.length > 0 && (
        <PanelList
          title="Blocked sources"
          description="Posts from these never show."
        >
          {blocked.map((source) => (
            <SourceRow key={source.id} source={source} />
          ))}
        </PanelList>
      )}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-text-primary typo-body">
            Follow a source
          </h3>
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
