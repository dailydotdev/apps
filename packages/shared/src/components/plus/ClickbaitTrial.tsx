import React, { useState, type ReactElement } from 'react';
import { PlusUser } from '../PlusUser';
import CloseButton from '../CloseButton';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { DevPlusIcon } from '../icons';
import { usePlusSubscription } from '../../hooks';
import { LogEvent, TargetId } from '../../lib/log';

export const ClickbaitTrial = (): ReactElement => {
  const [show, setShow] = useState(true);
  const { logSubscriptionEvent } = usePlusSubscription();

  if (!show) {
    return null;
  }

  return (
    <div className="relative mt-6 flex w-full flex-col rounded-12 border border-border-subtlest-tertiary bg-action-plus-float p-3">
      <div className="flex w-full items-start">
        <PlusUser className="rounded-4 bg-action-plus-float px-1 py-0.5 " />
        <CloseButton
          className="ml-auto"
          size={ButtonSize.Small}
          onClick={() => {
            setShow(false);
          }}
        />
      </div>
      <Typography
        bold
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        className="py-2"
      >
        Want to automatically optimize titles across your feed?
      </Typography>
      <Typography className="w-full">
        Clickbait Shield uses AI to automatically optimize post titles by fixing
        common problems like clickbait, lack of clarity, and overly promotional
        language.
        <br />
        <br />
        The result is clearer, more informative titles that help you quickly
        find the content you actually need.
      </Typography>

      <div className="mt-4 flex gap-2">
        <Button
          className="flex-1"
          tag="a"
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
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
        <Button
          className="flex-1"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={() => {
            setShow(false);
          }}
        >
          Not now
        </Button>
      </div>
    </div>
  );
};
