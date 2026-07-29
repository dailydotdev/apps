import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import useFeedSettings from '../../../hooks/useFeedSettings';

import { useAdvancedSettings } from '../../../hooks';
import {
  getAdvancedContentTypes,
  getContentCurationList,
  getContentSourceList,
} from '../../filters/helpers';
import { CardCheckbox } from '../../fields/CardCheckbox';
import { TOGGLEABLE_TYPES } from '../../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';
import { OnboardingHeadline } from '../common';
import {
  DiscussIcon,
  DocsIcon,
  HotIcon,
  ImageIcon,
  MegaphoneIcon,
  NumberedListIcon,
  PlayIcon,
  PollIcon,
  SquadIcon,
  StoryIcon,
  TLDRIcon,
  TwitterIcon,
} from '../../icons';

/**
 * Every title the step can render, from the production `advancedSettings`
 * query: the `content_source` group, then `content_curation` + `source_types`,
 * then the four in `TOGGLEABLE_TYPES`. Keyed by title because that is already
 * how this data is matched elsewhere (`getAdvancedContentTypes` does the same),
 * and an unmapped title just renders without an icon rather than breaking.
 */
const contentTypeIcon: Record<string, typeof PollIcon> = {
  Comparisons: TLDRIcon,
  Listicles: NumberedListIcon,
  Memes: ImageIcon,
  News: HotIcon,
  Opinions: DiscussIcon,
  Releases: MegaphoneIcon,
  Squads: SquadIcon,
  Stories: StoryIcon,
  Tutorials: DocsIcon,
  Videos: PlayIcon,
  Polls: PollIcon,
  Social: TwitterIcon,
};

/**
 * Retired types. The `advancedSettings` query still returns them, so they are
 * filtered here rather than assumed gone — onboarding stops offering them while
 * feed settings keeps rendering whatever the API sends.
 */
const RETIRED_TITLES = ['Community picks', 'Standups'];

interface ContentTypesProps {
  headline?: string;
}

export const ContentTypes = ({ headline }: ContentTypesProps): ReactElement => {
  const { advancedSettings } = useFeedSettings();
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings();

  const contentSourceList = useMemo(
    () =>
      getContentSourceList(advancedSettings).filter(
        ({ title }) => !RETIRED_TITLES.includes(title),
      ),
    [advancedSettings],
  );

  const contentCurationList = useMemo(
    () => getContentCurationList(advancedSettings),
    [advancedSettings],
  );

  const contentCurationAndVideoList = useMemo(() => {
    const listedTypes = getAdvancedContentTypes(
      TOGGLEABLE_TYPES,
      advancedSettings,
    );

    return contentCurationList
      .concat(listedTypes)
      .filter(({ title }) => !RETIRED_TITLES.includes(title));
  }, [contentCurationList, advancedSettings]);

  // Cards fill their grid column. The old `tablet:max-w-80` was a dead class —
  // `80` is not in this config's max-width scale — so it never capped anything.
  const classes = 'h-full w-full';

  return (
    <div className="flex w-full flex-col gap-6">
      <OnboardingHeadline>
        {headline || 'What kind of posts would you like to see on your feed?'}
      </OnboardingHeadline>
      {/* Two per row from tablet up, never three: with `h-full` on the cards
          every row is one height, so a two-line description no longer leaves
          its neighbour looking clipped. */}
      <div className="m-auto grid w-full max-w-[46rem] grid-cols-1 gap-2 tablet:grid-cols-2 tablet:gap-3">
        {contentSourceList?.map(({ id, title, description, options }) => {
          if (!options?.source) {
            return null;
          }

          const { source } = options;

          return (
            <CardCheckbox
              key={id}
              className={classes}
              onCheckboxToggle={() => onToggleSource(source)}
              checked={!checkSourceBlocked(source)}
              title={title}
              description={description}
              icon={contentTypeIcon[title]}
              inputProps={{
                checked: !checkSourceBlocked(source),
                name: `advancedSettings-${id}`,
              }}
            />
          );
        })}
        {contentCurationAndVideoList.map(
          ({ id, title, description, defaultEnabledState }) => (
            <CardCheckbox
              key={id}
              className={classes}
              onCheckboxToggle={() => onToggleSettings(id, defaultEnabledState)}
              checked={selectedSettings[id] ?? defaultEnabledState}
              title={title}
              description={description}
              icon={contentTypeIcon[title]}
              inputProps={{
                checked: selectedSettings[id] ?? defaultEnabledState,
                name: `advancedSettings-${id}`,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
};
