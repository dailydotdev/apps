import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Switch } from '../../fields/Switch';
import { useToggleFeedbackButton } from '../../../hooks/useToggleFeedbackButton';
import type { WithClassNameProps } from '../../utilities';

export const FeedbackButtonSection = ({
  className,
}: WithClassNameProps): ReactElement => {
  const { showFeedbackButton, toggleFeedbackButton } =
    useToggleFeedbackButton();

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
        onToggle={toggleFeedbackButton}
        aria-label="Toggle feedback button visibility"
      />
    </section>
  );
};
