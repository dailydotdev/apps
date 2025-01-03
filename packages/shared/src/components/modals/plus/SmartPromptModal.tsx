import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Image } from '../../image/Image';
import { clickbaitShieldModalImage } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { PlusUser } from '../../PlusUser';
import { Button, ButtonVariant } from '../../buttons/Button';
import { webappUrl } from '../../../lib/constants';
import { DevPlusIcon } from '../../icons';
import { LogEvent, TargetId } from '../../../lib/log';
import { usePlusSubscription } from '../../../hooks';

export const SmartPromptModal = ({ ...props }: ModalProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  return (
    <Modal {...props} isDrawerOnMobile>
      <Image
        className="mb-5 rounded-16"
        src={clickbaitShieldModalImage}
        alt="Smart Prompt feature"
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Typography type={TypographyType.Title2} bold>
            Smart Prompts
          </Typography>
          <PlusUser className="rounded-4 bg-action-plus-float px-1 py-0.5 " />
        </div>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Level up how you interact with posts using AI-powered prompts. Extract
          insights, refine content, or run custom instructions to get more out
          of every post in one click.
        </Typography>
        <Button
          tag="a"
          type="button"
          variant={ButtonVariant.Primary}
          href={`${webappUrl}plus`}
          icon={<DevPlusIcon className="text-action-plus-default" />}
          onClick={async () => {
            logSubscriptionEvent({
              event_name: LogEvent.UpgradeSubscription,
              target_id: TargetId.SmartPrompt,
            });
          }}
        >
          Upgrade to Plus
        </Button>
      </div>
    </Modal>
  );
};
