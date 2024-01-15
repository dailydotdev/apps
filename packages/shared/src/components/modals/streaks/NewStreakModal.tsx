import React, { ReactElement, useState } from 'react';
import { LazyModalCommonProps, Modal } from '../common/Modal';
import FireIcon from '../../icons/Fire';
import classed from '../../../lib/classed';
import TwitterIcon from '../../icons/Twitter';
import { ButtonVariant } from '../../buttons/common';
import { ButtonColor } from '../../buttons/ButtonV2';
import { SocialShareButton } from '../../widgets/SocialShareButton';
import WhatsappIcon from '../../icons/Whatsapp';
import StraightArrowIcon from '../../icons/Arrow/Straight';
import { IconSize } from '../../Icon';
import { Checkbox } from '../../fields/Checkbox';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { ModalClose } from '../common/ModalClose';

interface FirstStreakModalProps extends LazyModalCommonProps {
  currentStreak: number;
  previousStreak: number;
}

const Paragraph = classed('p', 'text-center text-theme-label-tertiary');

export default function FirstStreakModal({
  currentStreak,
  previousStreak,
  onRequestClose,
  ...props
}: FirstStreakModalProps): ReactElement {
  const [isChecked, setIsChecked] = useState(false);
  const { completeAction } = useActions();
  const onClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isChecked) {
      completeAction(ActionType.OptOutStreaks);
    }

    onRequestClose(e);
  };

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      className="relative !h-[auto] p-6"
      onRequestClose={onClose}
    >
      <ModalClose onClick={onRequestClose} className="right-2 top-2" />
      <span className="relative flex items-center justify-center">
        <FireIcon className="h-[10rem] w-[10rem] text-theme-color-bacon" />
        <strong className="typo-tera absolute">{currentStreak}</strong>
      </span>
      <strong className="mt-10 typo-title1">{currentStreak} days streak</strong>
      <Paragraph className="mt-5 typo-body">
        New milestone reached! You are unstoppable. Your previous record was{' '}
        {previousStreak} days.
      </Paragraph>
      <Paragraph className="mt-10 typo-callout">Brag about it via...</Paragraph>
      <span className="mt-3 flex flex-row gap-2">
        <SocialShareButton
          href="" // what should be the link
          icon={<TwitterIcon />}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Twitter}
          label="X"
        />
        <SocialShareButton
          href="" // what should be the link
          icon={<WhatsappIcon />}
          variant={ButtonVariant.Primary}
          color={ButtonColor.WhatsApp}
          label="WhatsApp"
        />
        <SocialShareButton
          href="" // what should be the link
          icon={
            <StraightArrowIcon
              className="text-theme-label-tertiary"
              size={IconSize.Small}
            />
          }
          variant={ButtonVariant.Float}
          label="WhatsApp"
        />
      </span>
      <Checkbox
        name="show_streaks"
        className="mt-10"
        checked={isChecked}
        onToggle={() => setIsChecked((state) => !state)}
      >
        Never show this again
      </Checkbox>
    </Modal>
  );
}
