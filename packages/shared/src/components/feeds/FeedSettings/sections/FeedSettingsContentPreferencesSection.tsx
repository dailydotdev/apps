import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import { useAdvancedSettings } from '../../../../hooks/feed/useAdvancedSettings';
import {
  getAdvancedContentTypes,
  getContentCurationList,
  getContentSourceList,
} from '../../../filters/helpers';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { FilterCheckbox } from '../../../fields/FilterCheckbox';
import { FeedType } from '../../../../graphql/feed';

export const TOGGLEABLE_TYPES = ['Videos', 'Polls', 'Social'];
const CUSTOM_FEEDS_ONLY = ['Article'];
const ADVANCED_SETTINGS_KEY = 'advancedSettings';

export const FeedSettingsContentPreferencesSection = (): ReactElement => {
  const { feed, editFeedSettings } = useContext(FeedSettingsEditContext);
  const { advancedSettings } = useFeedSettings({ feedId: feed?.id });
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings({ feedId: feed?.id });
  const toggleableTypes = useMemo(
    () =>
      getAdvancedContentTypes(
        TOGGLEABLE_TYPES.concat(CUSTOM_FEEDS_ONLY),
        advancedSettings,
      ),
    [advancedSettings],
  );

  const contentSourceList = useMemo(
    () => getContentSourceList(advancedSettings),
    [advancedSettings],
  );

  const contentCurationList = useMemo(
    () => getContentCurationList(advancedSettings),
    [advancedSettings],
  );

  return (
    <>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Shape your feed by choosing which types and categories of content appear
        in it. These are hard filters, so anything you turn off here won&apos;t
        show up at all.
      </Typography>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Content types
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Select the types of content you want to include in your feed.
          </Typography>
        </div>
        <div className="flex flex-col">
          {toggleableTypes.map((setting) => {
            if (!setting) {
              return null;
            }

            const { id, title, defaultEnabledState } = setting;
            const isDisabled =
              CUSTOM_FEEDS_ONLY.includes(title) &&
              feed?.type !== FeedType.Custom;

            if (isDisabled) {
              return (
                <FilterCheckbox key={id} name={title} disabled checked>
                  Articles
                </FilterCheckbox>
              );
            }

            return (
              <FilterCheckbox
                key={`advanced_types-${id}`}
                name={title}
                checked={selectedSettings[id] ?? defaultEnabledState}
                onToggleCallback={() =>
                  editFeedSettings(() =>
                    onToggleSettings(id, defaultEnabledState),
                  )
                }
              >
                {title}
              </FilterCheckbox>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Post types
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            These are the types of posts that can appear in your feed. Turn off
            the ones you&apos;d rather not see.
          </Typography>
        </div>
        {contentSourceList?.map(({ id, title, description, options }) => {
          if (!options?.source) {
            return null;
          }

          const { source } = options;

          return (
            <FilterCheckbox
              key={id}
              name={`${ADVANCED_SETTINGS_KEY}-${id}`}
              checked={!checkSourceBlocked(source)}
              description={description}
              onToggleCallback={() =>
                editFeedSettings(() => onToggleSource(source))
              }
              descriptionClassName="text-text-tertiary"
            >
              <Typography bold>{title}</Typography>
            </FilterCheckbox>
          );
        })}
        {contentCurationList?.map(
          ({ id, title, description, defaultEnabledState }) => (
            <FilterCheckbox
              key={id}
              name={`${ADVANCED_SETTINGS_KEY}-${id}`}
              checked={selectedSettings[id] ?? defaultEnabledState}
              description={description}
              onToggleCallback={() =>
                editFeedSettings(() =>
                  onToggleSettings(id, defaultEnabledState),
                )
              }
              descriptionClassName="text-text-tertiary"
            >
              <Typography bold>{title}</Typography>
            </FilterCheckbox>
          ),
        )}
      </div>
    </>
  );
};
