import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { formatParam, ParamFormat } from '../../policy/params';
import { describeAction, FeedAction } from '../../policy/glossary';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { SourceLevelControls } from './LevelTiming';
import {
  EntityRow,
  PanelList,
  PanelListEmpty,
  PanelSection,
  useFrozenGroups,
} from './Section';

type ListedSource = Source & { id: string };

const formatBoost = (value: number): string =>
  formatParam(ParamFormat.Multiplier, value);

const SourceRow = ({ source }: { source: ListedSource }): ReactElement => {
  const store = usePersonalization();
  const { state } = store;
  const { params } = state;
  const entity = { id: source.id, name: source.name ?? source.id };
  const isFollowed = state.followedSources.includes(source.id);
  const automatic = isFollowed ? params['follows.source_multiplier'] : 1;
  const exact = state.sourceWeights?.[source.id];
  const mode = state.sourceControls[source.id];
  const value =
    exact ?? automatic * (mode ? params['interests.control_demote'] : 1);
  const description = isFollowed
    ? 'You follow this. Every post from it shows up.'
    : "You don't follow this. Its posts show up when they match your topics.";

  return (
    <EntityRow
      media={
        <SourceAvatar
          source={source}
          size={ProfileImageSize.Medium}
          className="!mr-0"
        />
      }
      name={entity.name}
      description={description}
      boost={
        <SourceLevelControls
          source={entity}
          value={value}
          automatic={automatic}
        />
      }
      action={
        <Tooltip
          content={describeAction(
            isFollowed ? FeedAction.Unfollow : FeedAction.Follow,
            entity.name,
          )}
        >
          <Button
            type="button"
            className="w-24"
            variant={isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => store.setSourceFollowed(entity, !isFollowed)}
          >
            {isFollowed ? 'Unfollow' : 'Follow'}
          </Button>
        </Tooltip>
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
  const lists = useFrozenGroups({
    sources: [...state.followedSources, ...adjusted],
    people: state.followedAuthors,
  });
  // A blocked source leaves the list; every other row stays where it was.
  const listed = toSources(lists.sources).filter(
    ({ id }) => !state.blockedSources.includes(id),
  );

  return (
    <PanelSection
      section={ControlSection.Sources}
      description="Every post from a source or person you follow shows up. Show less ranks a source's posts lower; tap its boost for the exact value. Reading from a source doesn't add it here; only follows do."
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
        {lists.people.map((id) => {
          const author = { id, name: authorById.get(id) ?? id };
          const isFollowed = state.followedAuthors.includes(id);
          return (
            <EntityRow
              key={id}
              name={author.name}
              description={
                isFollowed
                  ? `Every post they write shows up, ${formatBoost(
                      state.params['follows.author_multiplier'],
                    )}.`
                  : "You don't follow them now."
              }
              action={
                <Tooltip
                  content={describeAction(
                    isFollowed ? FeedAction.Unfollow : FeedAction.Follow,
                    author.name,
                  )}
                >
                  <Button
                    type="button"
                    className="w-24"
                    variant={
                      isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary
                    }
                    size={ButtonSize.Small}
                    onClick={() => store.setAuthorFollowed(author, !isFollowed)}
                  >
                    {isFollowed ? 'Unfollow' : 'Follow'}
                  </Button>
                </Tooltip>
              }
            />
          );
        })}
        {!lists.people.length && (
          <PanelListEmpty>
            You don&apos;t follow anyone yet. Following a writer shows you every
            post they write.
          </PanelListEmpty>
        )}
      </PanelList>
    </PanelSection>
  );
};
