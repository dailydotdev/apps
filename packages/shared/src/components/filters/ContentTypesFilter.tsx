import React, { ReactElement } from 'react';
import { FilterCheckbox } from '../fields/FilterCheckbox';
import { useAdvancedSettings } from '../../hooks/feed';
import useFeedSettings from '../../hooks/useFeedSettings';
import { getVideoSetting } from './helpers';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Divider } from '../utilities';
import { LanguageDropdown } from '../profile/LanguageDropdown';
import { useAuthContext } from '../../contexts/AuthContext';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { useLanguage } from '../../hooks/useLanguage';

export function ContentTypesFilter(): ReactElement {
  const postTitleLanguageFeature = useFeature(feature.postTitleLanguage);
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const { user } = useAuthContext();

  const videoSetting = getVideoSetting(advancedSettings);

  const { onLanguageChange } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      {postTitleLanguageFeature && (
        <>
          <section className="flex flex-col gap-4" aria-busy={isLoading}>
            <div className="flex flex-col">
              <Typography
                tag={TypographyTag.H3}
                color={TypographyColor.Primary}
                type={TypographyType.Body}
                bold
                className="mb-1"
              >
                Preferred language
              </Typography>
              <Typography
                color={TypographyColor.Tertiary}
                type={TypographyType.Callout}
              >
                Choose your preferred language for the post titles on the feed
              </Typography>
            </div>
            <LanguageDropdown
              className={{ container: 'w-full max-w-60' }}
              name="language"
              defaultValue={user.language}
              onChange={(value) => onLanguageChange(value)}
              icon={null}
            />
          </section>
          <Divider className="bg-border-subtlest-tertiary" />
        </>
      )}
      <section className="flex flex-col gap-4" aria-busy={isLoading}>
        <div className="flex flex-col">
          <Typography
            tag={TypographyTag.H3}
            color={TypographyColor.Primary}
            type={TypographyType.Body}
            bold
            className="mb-1"
          >
            Content type
          </Typography>
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
          >
            Show or hide content from your feed
          </Typography>
        </div>
        <div className="flex flex-col">
          {videoSetting && (
            <FilterCheckbox
              name={videoSetting.title}
              checked={
                selectedSettings[videoSetting.id] ??
                videoSetting.defaultEnabledState
              }
              onToggle={() =>
                onToggleSettings(
                  videoSetting.id,
                  videoSetting.defaultEnabledState,
                )
              }
            >
              {videoSetting.title}
            </FilterCheckbox>
          )}
          <FilterCheckbox name="Articles" disabled checked>
            Articles
          </FilterCheckbox>
        </div>
      </section>
    </div>
  );
}
