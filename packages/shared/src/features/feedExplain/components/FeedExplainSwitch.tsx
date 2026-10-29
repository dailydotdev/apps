import type { ReactElement } from 'react';
import React from 'react';
import { Switch } from '../../../components/fields/Switch';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { TerminalIcon } from '../../../components/icons/Terminal';
import { MagicIcon } from '../../../components/icons/Magic';
import { ArrowIcon } from '../../../components/icons/Arrow';
import { IconSize } from '../../../components/Icon';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetId } from '../../../lib/log';
import { useFeedExplainMode } from '../useFeedExplainMode';
import { useOpenFeedTune } from '../useOpenFeedTune';

interface FeedExplainSwitchProps {
  /** The feed's sort is Recommended, the only one that explains itself. */
  isRecommended: boolean;
  /** A switch row of its own, for the phone's For you sheet. */
  isRow?: boolean;
  /** The toolbar's look, matching the Feed settings button beside it. */
  buttonProps?: Pick<
    ButtonProps<'button'>,
    'size' | 'variant' | 'className'
  > & {
    iconSize?: IconSize;
  };
  iconOnly?: boolean;
}

const title = 'See why each post is on your feed';
const tuneTitle = 'Try changes to your feed before you save them';

/**
 * The Debug toggle: turns Explain mode on For You on and off. While it is
 * on, Tune sits beside it.
 */
export const FeedExplainSwitch = ({
  isRecommended,
  isRow,
  buttonProps,
  iconOnly,
}: FeedExplainSwitchProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { isAvailable, isExplaining, setIsExplaining, version } =
    useFeedExplainMode({ isRecommended });
  const openTune = useOpenFeedTune(Origin.FeedExplain);

  if (!isAvailable) {
    return null;
  }

  const onToggle = () => {
    logEvent({
      event_name: LogEvent.ToggleFeedExplain,
      target_id: isExplaining ? TargetId.Off : TargetId.On,
    });
    setIsExplaining(!isExplaining);
  };

  if (isRow) {
    return (
      <>
        <Switch
          inputId="feed-explain-sheet"
          name="feed-explain"
          checked={isExplaining}
          onToggle={onToggle}
          title={title}
          className="h-12 w-full flex-row-reverse justify-between px-4"
          labelClassName="!ml-0 text-text-primary"
        >
          Debug
        </Switch>
        {isExplaining && (
          <button
            type="button"
            title={tuneTitle}
            onClick={() => openTune(version)}
            className="flex h-12 w-full items-center gap-3 px-4 text-left text-text-primary transition-colors typo-callout hover:bg-surface-hover"
          >
            <MagicIcon size={IconSize.Small} className="text-text-tertiary" />
            <span className="flex-1">Tune your feed</span>
            <ArrowIcon
              size={IconSize.Size16}
              className="rotate-90 text-text-quaternary"
            />
          </button>
        )}
      </>
    );
  }

  const { iconSize, ...buttonOverrides } = buttonProps ?? {};

  return (
    <>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        icon={iconSize ? <TerminalIcon size={iconSize} /> : <TerminalIcon />}
        iconPosition={ButtonIconPosition.Left}
        pressed={isExplaining}
        color={ButtonColor.Cabbage}
        title={title}
        aria-label={iconOnly ? 'Debug' : undefined}
        onClick={onToggle}
        {...buttonOverrides}
      >
        {iconOnly ? null : 'Debug'}
      </Button>
      {isExplaining && (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          icon={iconSize ? <MagicIcon size={iconSize} /> : <MagicIcon />}
          iconPosition={ButtonIconPosition.Left}
          title={tuneTitle}
          aria-label={iconOnly ? 'Tune' : undefined}
          onClick={() => openTune(version)}
          {...buttonOverrides}
        >
          {iconOnly ? null : 'Tune'}
        </Button>
      )}
    </>
  );
};
