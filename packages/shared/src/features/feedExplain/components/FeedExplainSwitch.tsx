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
import type { IconSize } from '../../../components/Icon';
import { Origin } from '../../../lib/log';
import { useFeedExplainMode } from '../useFeedExplainMode';
import { useSetFeedExplain } from '../useSetFeedExplain';

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

/** The Debug toggle: turns Explain mode on For You on and off. */
export const FeedExplainSwitch = ({
  isRecommended,
  isRow,
  buttonProps,
  iconOnly,
}: FeedExplainSwitchProps): ReactElement | null => {
  const { isAvailable, isExplaining } = useFeedExplainMode({
    isRecommended,
  });
  const setIsExplaining = useSetFeedExplain(Origin.Feed);

  if (!isAvailable) {
    return null;
  }

  const onToggle = () => setIsExplaining(!isExplaining);

  if (isRow) {
    return (
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
    );
  }

  const { iconSize, ...buttonOverrides } = buttonProps ?? {};

  return (
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
  );
};
