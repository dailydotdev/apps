import React, { type ReactElement } from 'react';
import { Modal, type ModalProps } from './common/Modal';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { PlusUser } from '../PlusUser';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { DevPlusIcon } from '../icons';
import { usePlusSubscription, useViewSize, ViewSize } from '../../hooks';
import { LogEvent, TargetId } from '../../lib/log';
import { Switch } from '../fields/Switch';
import { useLazyModal } from '../../hooks/useLazyModal';

const ClickbaitShieldModal = (props: ModalProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  const { closeModal } = useLazyModal();
  const isMobile = useViewSize(ViewSize.MobileL);
  if (!isMobile) {
    closeModal();
    return null;
  }

  return (
    <Modal {...props} isDrawerOnMobile>
      <Image
        className="mb-5 rounded-16"
        src="https://daily-now-res.cloudinary.com/image/upload/s--GWqpMG8r--/f_auto/v1732802237/Streak_together_with_a_friend_1_1_pwoill"
        alt="Clickbait shield feature"
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Typography type={TypographyType.Title2} bold>
            Clickbait Shield
          </Typography>
          <PlusUser className="rounded-4 bg-action-plus-float px-1 py-0.5 " />
        </div>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Clickbait Shield uses AI to automatically optimize post titles by
          fixing common problems like clickbait, lack of clarity, and overly
          promotional language.
        </Typography>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          The result is clearer, more informative titles that help you quickly
          find the content you actually need.
        </Typography>

        <Switch
          className="my-4"
          inputId="clickbait-shield-switch"
          name="clickbait_shield"
          compact={false}
          disabled
        >
          <Typography type={TypographyType.Callout}>
            Optimize title quality
          </Typography>
        </Switch>

        <Button
          tag="a"
          type="button"
          variant={ButtonVariant.Primary}
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
      </div>
    </Modal>
  );
};

export default ClickbaitShieldModal;
