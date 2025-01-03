import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { LogEvent, Origin, TargetId } from '../../lib/log';
import { Switch } from '../fields/Switch';
import { PlusUser } from '../PlusUser';
import { webappUrl } from '../../lib/constants';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { SidebarSettingsFlags } from '../../graphql/settings';
import { useLogContext } from '../../contexts/LogContext';
import ConditionalWrapper from '../ConditionalWrapper';
import { SimpleTooltip } from '../tooltips';
import { ActiveFeedContext } from '../../contexts';

export function ContentTypesFilter(): ReactElement {
  const queryClient = useQueryClient();
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);
  const { logEvent } = useLogContext();
  const { advancedSettings, isLoading } = useFeedSettings();
  const { selectedSettings, onToggleSettings } = useAdvancedSettings();
  const { user } = useAuthContext();
  const { isPlus, showPlusSubscription, logSubscriptionEvent } =
    usePlusSubscription();
  const { flags, updateFlag } = useSettingsContext();

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
            <ConditionalWrapper
              condition={!isPlus}
              wrapper={(child) => {
                return (
                  <SimpleTooltip
                    container={{
                      className: 'max-w-70 text-center typo-subhead',
                    }}
                    content="Upgrade to Plus to unlock Clickbait Shield and enhance titles automatically."
                  >
                    <div className="w-fit">{child as ReactElement}</div>
                  </SimpleTooltip>
                );
              }}
            >
              <Switch
                inputId="clickbait-shield-switch"
                name="clickbait_shield"
                compact={false}
                disabled={!isPlus}
                checked={isPlus ? flags?.clickbaitShieldEnabled : false}
                onClick={async () => {
                  const newState = !flags?.clickbaitShieldEnabled;
                  await updateFlag(
                    SidebarSettingsFlags.ClickbaitShieldEnabled,
                    newState,
                  );
                  await queryClient.cancelQueries({
                    queryKey: feedQueryKey,
                  });
                  await queryClient.invalidateQueries({
                    queryKey: feedQueryKey,
                    stale: true,
                  });
                  logEvent({
                    event_name: LogEvent.ToggleClickbaitShield,
                    target_id: newState ? TargetId.On : TargetId.Off,
                    extra: JSON.stringify({
                      origin: Origin.Settings,
                    }),
                  });
                }}
              >
                Optimize title quality
              </Switch>
            </ConditionalWrapper>
            {!isPlus && (
              <Button
                className="w-fit"
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
            )}
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
