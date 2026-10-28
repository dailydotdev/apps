import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Switch } from '../../../components/fields/Switch';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetId } from '../../../lib/log';
import { useFeedExplainMode } from '../useFeedExplainMode';

interface FeedExplainSwitchProps {
  /** The feed's sort is Recommended, the only one that explains itself. */
  isRecommended: boolean;
  /** A row of its own, for the phone's For you sheet. */
  isRow?: boolean;
  className?: string;
}

/** Turns Explain mode on For You on and off. */
export const FeedExplainSwitch = ({
  isRecommended,
  isRow,
  className,
}: FeedExplainSwitchProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { isAvailable, isExplaining, setIsExplaining } = useFeedExplainMode({
    isRecommended,
  });

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

  return (
    <Switch
      inputId={isRow ? 'feed-explain-sheet' : 'feed-explain'}
      name="feed-explain"
      checked={isExplaining}
      onToggle={onToggle}
      compact={!isRow}
      title="See why each post is on your feed"
      className={classNames(
        isRow && 'h-12 w-full flex-row-reverse justify-between px-4',
        className,
      )}
      labelClassName={isRow ? '!ml-0 text-text-primary' : undefined}
    >
      Explain
    </Switch>
  );
};
