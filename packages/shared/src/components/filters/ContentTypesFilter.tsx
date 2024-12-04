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
import { useLanguage } from '../../hooks/useLanguage';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { DevPlusIcon } from '../icons';
import { usePlusSubscription } from '../../hooks';
import { LogEvent, TargetId } from '../../lib/log';
import { Switch } from '../fields/Switch';
import { PlusUser } from '../PlusUser';
import { webappUrl } from '../../lib/constants';

export function ContentTypesFilter(): ReactElement {
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const { user } = useAuthContext();
  const { isPlus, showPlusSubscription, logSubscriptionEvent } =
    usePlusSubscription();

  const videoSetting = getVideoSetting(advancedSettings);

  const { onLanguageChange } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      {showPlusSubscription && (
        <>
          <section className="flex flex-col gap-4" aria-busy={isLoading}>
            <div className="flex flex-col">
              <div className="mb-1 flex items-center gap-2">
                <Typography
                  tag={TypographyTag.H3}
                  color={TypographyColor.Primary}
                  type={TypographyType.Body}
                  bold
                >
                  Clickbait Shield
                </Typography>
                <PlusUser />
              </div>
              <Typography
                className="pr-24"
                color={TypographyColor.Tertiary}
                type={TypographyType.Callout}
              >
                Clickbait Shield uses AI to automatically optimize post titles
                by fixing common problems like clickbait, lack of clarity, and
                overly promotional language. The result is clearer, more
                informative titles that help you quickly find the content you
                actually need.
              </Typography>
            </div>
            <Switch
              inputId="clickbait-shield-switch"
              name="clickbait_shield"
              compact={false}
              disabled
            >
              Optimize title quality
            </Switch>
            {!isPlus && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-10 border border-border-subtlest-tertiary bg-action-plus-float p-4 text-center laptop:flex-row laptop:text-left">
                <Typography
                  className="flex flex-1"
                  type={TypographyType.Body}
                  color={TypographyColor.Primary}
                >
                  Upgrade to daily.dev Plus today, get an early adopter discount
                  and be among the first to experience it as soon as it
                  launches!
                </Typography>
                <Button
                  className="flex w-full laptop:w-auto"
                  tag="a"
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Medium}
                  href={`${webappUrl}plus`}
                  icon={<DevPlusIcon className="text-action-plus-default" />}
                  onClick={() => {
                    logSubscriptionEvent({
                      event_name: LogEvent.UpgradeSubscription,
                      target_id: TargetId.ClickbaitShield,
                    });
                  }}
                >
                  Upgrade to Plus
                </Button>
              </div>
            )}
            <div className="absolute -right-14 top-8 w-52 rotate-45 bg-action-plus-default px-2 py-1 text-center text-white">
              <Typography type={TypographyType.Callout} bold>
                Coming soon
              </Typography>
            </div>
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
              onToggleCallback={() =>
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
