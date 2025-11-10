import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { PlusIcon } from './icons';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { useLogContext } from '../contexts/LogContext';
import type { LogEvent } from '../hooks/log/useLogQueue';

interface CreateMyFeedButtonProps {
  action: () => unknown;
}

const getLogEvent = (eventName: string, copy: string): LogEvent => ({
  event_name: eventName,
  target_type: 'my feed button',
  target_id: 'feed_top',
  feed_item_title: copy,
});

export default function CreateMyFeedButton({
  action,
}: CreateMyFeedButtonProps): ReactElement {
  const { logEvent } = useLogContext();
  const buttonCopy = 'Choose tags';
  const explainerCopy = 'Get the content you need by creating a personal feed';
  const onClick = () => {
    logEvent(getLogEvent('click', buttonCopy));
    action();
  };

  useEffect(() => {
    logEvent(getLogEvent('impression', buttonCopy));
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonCopy]);

  return (
    <div className="mb-4 flex w-full flex-col items-center">
      <div className="rounded-12 border-accent-cabbage-default shadow-2-cabbage tablet:flex-row flex flex-col items-center border p-2">
        <p className="typo-footnote tablet:text-left ml-2 text-center transition-all">
          {explainerCopy}
        </p>
        <Button
          className="tablet:ml-8 tablet:mt-0 ml-0 mt-4"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          onClick={onClick}
        >
          {buttonCopy}
        </Button>
      </div>
    </div>
  );
}
