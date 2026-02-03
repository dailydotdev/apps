import React, { useCallback } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Switch } from '../../fields/Switch';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import type { WithClassNameProps } from '../../utilities';

export const FeedbackButtonSection = ({
  className,
}: WithClassNameProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { showFeedbackButton, toggleShowFeedbackButton } = useSettingsContext();

  const onToggle = useCallback(() => {
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.FeedbackButton,
      target_id: !showFeedbackButton ? 'show' : 'hide',
    });
    return toggleShowFeedbackButton();
  }, [logEvent, showFeedbackButton, toggleShowFeedbackButton]);

  return (
    <section
      className={classNames('flex items-center justify-between', className)}
    >
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Subhead}
      >
        Feedback button
      </Typography>

      <Switch
        inputId="feedback-button-switch"
        name="feedback-button"
        compact
        checked={showFeedbackButton}
        onToggle={onToggle}
        aria-label="Toggle feedback button visibility"
      />
    </section>
  );
};
