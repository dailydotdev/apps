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

// Keyed by title, as the rest of this data is. An unmapped title renders
// without an icon rather than breaking.
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

  // `h-full` so every row is one height; the paid funnel keeps main's card.
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
            />
          ),
        )}
      </div>
    </div>
  );
};
