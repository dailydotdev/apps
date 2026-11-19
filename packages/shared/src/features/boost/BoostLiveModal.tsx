import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../../components/modals/common/Modal';
import type { ModalProps } from '../../components/modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { VIcon } from '../../components/icons/V';
import { IconSize } from '../../components/Icon';
import { ModalClose } from '../../components/modals/common/ModalClose';
import { boostDocsLink, boostManagerUrl } from '../../lib/constants';
import { boostLiveArt } from '../../lib/image';

interface BoostLiveModalProps extends ModalProps {
  description: string;
}

/** The success screen after a boost starts: the rocket art and a check badge */
export function BoostLiveModal({
  description,
  ...props
}: BoostLiveModalProps): ReactElement {
  const { onRequestClose } = props;

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Body className="flex flex-col !p-0">
        <div className="relative">
          <div className="relative h-32 w-full overflow-hidden rounded-t-16 bg-gradient-to-r from-accent-cabbage-subtler to-transparent">
            <img
              src={boostLiveArt}
              alt=""
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-auto max-w-none"
            />
          </div>
          <ModalClose
            className="hidden tablet:flex"
            right="2"
            top="2"
            size={ButtonSize.Small}
            onClick={onRequestClose}
            variant={ButtonVariant.Tertiary}
          />
          <span className="absolute -bottom-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background-default bg-accent-blueCheese-default text-surface-invert">
            <VIcon size={IconSize.Medium} />
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 px-5 pb-5 pt-9 text-center">
          <Typography type={TypographyType.Title3} bold>
            Boost is live!
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
          <Button
            tag="a"
            href={boostManagerUrl}
            variant={ButtonVariant.Primary}
            className="mt-3 w-full"
            onClick={onRequestClose}
          >
            See your boost
          </Button>
          <Button
            variant={ButtonVariant.Tertiary}
            className="w-full"
            tag="a"
            href={boostDocsLink}
            target="_blank"
          >
            Learn more about boosting
          </Button>
          <Button
            variant={ButtonVariant.Float}
            className="mt-1 w-full tablet:hidden"
            onClick={onRequestClose}
          >
            Close
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
