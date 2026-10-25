import type { ReactElement } from 'react';
import React from 'react';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { readingReminderPushPromptCopy } from '../../hooks/notifications/useReadingReminderPushPrompt';

interface ReadingReminderPushAlertProps {
  onEnable: () => unknown;
}

const ReadingReminderPushAlert = ({
  onEnable,
}: ReadingReminderPushAlertProps): ReactElement => (
  <Alert type={AlertType.Warning} title={readingReminderPushPromptCopy.title}>
    <AlertParagraph>
      Allow notifications on this device to get your daily reading reminder.
    </AlertParagraph>
    <Button
      className="mt-3 w-fit"
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
      onClick={onEnable}
    >
      {readingReminderPushPromptCopy.cta}
    </Button>
  </Alert>
);

export default ReadingReminderPushAlert;
