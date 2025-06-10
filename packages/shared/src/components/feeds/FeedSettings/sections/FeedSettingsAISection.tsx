import type { ReactElement } from 'react';
import React from 'react';
import {
  useConditionalFeature,
  usePlusSubscription,
  useToastNotification,
  useClickbaitTries,
} from '../../../../hooks';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { SidebarSettingsFlags } from '../../../../graphql/settings';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import { useLanguage } from '../../../../hooks/useLanguage';
import { plusUrl } from '../../../../lib/constants';
import { LogEvent, TargetId, Origin } from '../../../../lib/log';
import { Button } from '../../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../../buttons/common';
import ConditionalWrapper from '../../../ConditionalWrapper';
import { DevPlusIcon, ShieldPlusIcon } from '../../../icons';
import { PlusUser } from '../../../PlusUser';
import { LanguageDropdown } from '../../../profile/LanguageDropdown';
import { SimpleTooltip } from '../../../tooltips';
import {
  Typography,
  TypographyTag,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Divider } from '../../../utilities';
import { Switch } from '../../../fields/Switch';
import { labels } from '../../../../lib';
import { SmartPrompts } from '../components/SmartPrompts';
import { featurePlusCtaCopy } from '../../../../lib/featureManagement';
import Link from '../../../utilities/Link';

export const FeedSettingsAISection = (): ReactElement => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { isLoading } = useFeedSettings();
  const { user } = useAuthContext();
  const { flags, updateFlag } = useSettingsContext();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus,
  });

  const { maxTries, triesLeft } = useClickbaitTries();

  const { onLanguageChange } = useLanguage();

  return (
    <>
      {!isPlus && (
        <>
          <div className="flex w-full items-center rounded-12 border border-border-subtlest-tertiary bg-action-plus-float p-3">
            <Typography type={TypographyType.Callout}>
              Upgrade and use daily.dev&apos;s AI Superpowers!
            </Typography>
            <Link href={plusUrl} passHref>
              <Button
                className="ml-auto w-fit"
                tag="a"
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Medium}
                icon={<DevPlusIcon className="text-action-plus-default" />}
                onClick={() => {
                  logSubscriptionEvent({
                    event_name: LogEvent.UpgradeSubscription,
                    target_id: TargetId.FeedSettings,
                  });
                }}
              >
                {plusCta}
              </Button>
            </Link>
          </div>
          <Divider className="bg-border-subtlest-tertiary" />
        </>
      )}

      <section className="flex flex-col gap-4" aria-busy={isLoading}>
        <div className="flex flex-col">
          <div className="mb-1 flex items-center gap-2">
            <Typography
              tag={TypographyTag.H3}
              color={TypographyColor.Primary}
              type={TypographyType.Body}
              bold
            >
              Auto-translate your feed
            </Typography>
            <PlusUser />
          </div>
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
          >
            Choose your preferred language, and we&apos;ll automatically
            translate post titles and TLDR summaries in your feed. The full
            posts will still be in English, but this helps you quickly
            understand what&apos;s worth reading.
          </Typography>
        </div>
        <LanguageDropdown
          className={{ container: 'w-full max-w-60' }}
          name="language"
          defaultValue={user.language}
          onChange={(value) => {
            onLanguageChange(value);

            displayToast(
              labels.feed.settings.globalPreferenceNotice.contentLanguage,
            );
          }}
          icon={null}
          disabled={!isPlus}
        />
      </section>

      <Divider className="bg-border-subtlest-tertiary" />

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
            Clickbait Shield uses AI to automatically optimize post titles by
            fixing common problems like clickbait, lack of clarity, and overly
            promotional language. The result is clearer, more informative titles
            that help you quickly find the content you actually need.
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
          {!isPlus ? (
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              disabled
              icon={<ShieldPlusIcon />}
              className="mb-4"
            >
              {triesLeft}/{maxTries} uses left this month
            </Button>
          ) : undefined}
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

              displayToast(
                labels.feed.settings.globalPreferenceNotice.clickbaitShield,
              );

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
      </section>

      <Divider className="bg-border-subtlest-tertiary" />

      <SmartPrompts />
    </>
  );
};
