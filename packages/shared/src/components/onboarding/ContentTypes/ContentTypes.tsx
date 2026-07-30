import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
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
import { withoutRetiredTitles } from './helpers';
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

interface ContentTypesProps {
  headline?: string;
  // The post-signup funnel's treatment: retired types dropped, two-column card
  // grid, shared headline. The paid funnel keeps main's three-column layout and
  // the full type list.
  isOnboarding?: boolean;
}

export const ContentTypes = ({
  headline,
  isOnboarding,
}: ContentTypesProps): ReactElement => {
  const { advancedSettings } = useFeedSettings();
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings();

  const contentSourceList = useMemo(
    () =>
      withoutRetiredTitles(
        getContentSourceList(advancedSettings),
        isOnboarding,
      ),
    [advancedSettings, isOnboarding],
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

    return withoutRetiredTitles(
      contentCurationList.concat(listedTypes),
      isOnboarding,
    );
  }, [contentCurationList, advancedSettings, isOnboarding]);

  // Onboarding cards fill their grid column so every row is one height; the
  // paid funnel keeps main's fixed-height card. (`max-w-80` there was already a
  // dead class — 80 is not in this config's max-width scale.)
  const classes = isOnboarding ? 'h-full w-full' : '!h-[8.25rem] max-w-80';
  const defaultHeadline =
    headline || 'What kind of posts would you like to see on your feed?';

  return (
    <div
      className={classNames('flex flex-col', isOnboarding && 'w-full gap-6')}
    >
      {isOnboarding ? (
        <OnboardingHeadline>{defaultHeadline}</OnboardingHeadline>
      ) : (
        <h2 className="mb-10 text-center typo-large-title">
          {defaultHeadline}
        </h2>
      )}
      {/* Onboarding shows two per row from tablet up, never three: with `h-full`
          on the cards every row is one height, so a two-line description no
          longer leaves its neighbour looking clipped. */}
      <div
        className={classNames(
          'm-auto grid grid-cols-1 gap-2 tablet:grid-cols-2',
          isOnboarding
            ? 'w-full max-w-[46rem] tablet:gap-3'
            : 'tablet:gap-5 laptop:grid-cols-3',
        )}
      >
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
