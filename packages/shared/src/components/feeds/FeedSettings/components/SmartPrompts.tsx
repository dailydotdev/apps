import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { PlusUser } from '../../../PlusUser';
import ConditionalWrapper from '../../../ConditionalWrapper';
import { SimpleTooltip } from '../../../tooltips';
import { LogEvent, Origin, TargetId } from '../../../../lib/log';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { webappUrl } from '../../../../lib/constants';
import { DevPlusIcon } from '../../../icons';
import { usePlusSubscription, useToastNotification } from '../../../../hooks';
import { usePromptsQuery } from '../../../../hooks/prompt/usePromptsQuery';
import { FilterCheckbox } from '../../../fields/FilterCheckbox';
import { useSettingsContext } from '../../../../contexts/SettingsContext';
import { labels } from '../../../../lib';
import { useLogContext } from '../../../../contexts/LogContext';

export const SmartPrompts = (): ReactElement => {
  const { isPlus, logSubscriptionEvent } = usePlusSubscription();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { flags, updatePromptFlag } = useSettingsContext();
  const { prompt: promptFlags } = flags;
  const { data: prompts, isLoading } = usePromptsQuery();

  return (
    <section className="flex flex-col gap-4" aria-busy={isLoading}>
      <div className="flex flex-col">
        <div className="mb-1 flex items-center gap-2">
          <Typography
            tag={TypographyTag.H3}
            color={TypographyColor.Primary}
            type={TypographyType.Body}
            bold
          >
            Smart Prompts
          </Typography>
          <PlusUser />
        </div>
        <Typography
          className="pr-24"
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
        >
          Level up how you interact with posts using AI-powered prompts. Extract
          insights, refine content, or run custom instructions to get more out
          of every post in one click.
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
              content="Upgrade to Plus to unlock Smart Prompts."
            >
              <div className="w-fit">{child as ReactElement}</div>
            </SimpleTooltip>
          );
        }}
      >
        <div className="flex flex-col gap-2">
          {prompts?.map(({ id, label, description }) => (
            <FilterCheckbox
              key={id}
              name={`prompt-${id}`}
              checked={promptFlags?.[id] ?? true}
              description={description}
              disabled={!isPlus}
              onToggleCallback={() => {
                const newState = !(promptFlags?.[id] || true);
                updatePromptFlag(id, newState);
                displayToast(
                  labels.feed.settings.globalPreferenceNotice.smartPrompt,
                );

                logEvent({
                  event_name: LogEvent.ToggleSmartPrompts,
                  target_id: newState ? TargetId.On : TargetId.Off,
                  extra: JSON.stringify({
                    origin: Origin.Settings,
                  }),
                });
              }}
              descriptionClassName="text-text-tertiary"
            >
              <Typography bold>{label}</Typography>
            </FilterCheckbox>
          ))}
        </div>
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
  );
};
