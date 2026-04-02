import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import { useAdvancedSettings } from '../../../../hooks/feed/useAdvancedSettings';
import { useConditionalFeature, useToastNotification } from '../../../../hooks';
import { useLogContext } from '../../../../contexts/LogContext';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
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
import { Switch } from '../../../fields/Switch';
import { FeedType } from '../../../../graphql/feed';
import { featureNoAiFeed } from '../../../../lib/featureManagement';
import { SidebarSettingsFlags } from '../../../../graphql/settings';
import { labels } from '../../../../lib/labels';
import { LogEvent, Origin, TargetId } from '../../../../lib/log';

export const TOGGLEABLE_TYPES = ['Videos', 'Polls', 'Social'];
const CUSTOM_FEEDS_ONLY = ['Article'];
const ADVANCED_SETTINGS_KEY = 'advancedSettings';

export const FeedSettingsContentPreferencesSection = (): ReactElement => {
  const { feed, editFeedSettings } = useContext(FeedSettingsEditContext);
  const { flags, updateFlag } = useSettingsContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { advancedSettings } = useFeedSettings({ feedId: feed?.id });
  const {
    selectedSettings,
    onToggleSettings,
    checkSourceBlocked,
    onToggleSource,
  } = useAdvancedSettings({ feedId: feed?.id });
  const { value: isNoAiFeatureEnabled } = useConditionalFeature({
    feature: featureNoAiFeed,
    shouldEvaluate: feed?.type === FeedType.Main,
  });
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
            Categories
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Pick the categories of content you&apos;d like to see in your feed.
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
      {feed?.type === FeedType.Main && isNoAiFeatureEnabled && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Body}>
              No AI mode
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Filter out AI launches, hot takes, and tooling discourse from My
              Feed.
            </Typography>
          </div>
          <Switch
            inputId="no-ai-feed-preference-switch"
            name="no_ai_feed_preference"
            compact={false}
            checked={flags?.noAiFeedEnabled ?? false}
            onClick={() => {
              const newState = !(flags?.noAiFeedEnabled ?? false);

              editFeedSettings(() =>
                updateFlag(SidebarSettingsFlags.NoAiFeedEnabled, newState),
              );
              displayToast(
                newState ? labels.feed.noAi.hidden : labels.feed.noAi.visible,
              );
              logEvent({
                event_name: LogEvent.ToggleNoAiFeed,
                target_id: newState ? TargetId.On : TargetId.Off,
                extra: JSON.stringify({
                  origin: Origin.Settings,
                }),
              });
            }}
          >
            Keep AI topics filtered out
          </Switch>
        </div>
      )}
    </>
  );
};
