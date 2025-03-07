import type { ReactElement } from 'react';
import React, { useCallback } from 'react';

import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon, CoinIcon } from '../../icons';
import { Image } from '../../image/Image';
import { cloudinaryAwardUnicorn } from '../../../lib/image';
import type { AwardTypes } from '../../../contexts/GiveAwardModalContext';
import {
  GiveAwardModalContextProvider,
  useGiveAwardModalContext,
} from '../../../contexts/GiveAwardModalContext';
import { Justify } from '../../utilities';
import MarkdownInput from '../../fields/MarkdownInput';
import { termsOfService } from '../../../lib/constants';
import { useViewSize, ViewSize } from '../../../hooks';
import { ModalKind } from '../common/types';
import { IconSize } from '../../Icon';
import { BuyCreditsButton } from '../../credit/BuyCreditsButton';
import { BuyCoresModal } from './BuyCoresModal';

const AwardItem = () => {
  const { setActiveStep } = useGiveAwardModalContext();
  return (
    <Button
      variant={ButtonVariant.Float}
      className="flex !h-auto flex-col items-center justify-center gap-2 rounded-14 bg-surface-float !p-1"
      onClick={() => setActiveStep('COMMENT')}
    >
      <Image
        src={cloudinaryAwardUnicorn}
        alt="Award unicorn"
        className="size-20"
      />
      <div className="flex items-center justify-center">
        <CoinIcon size={IconSize.Size16} />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          tag={TypographyTag.Span}
        >
          Free
        </Typography>
      </div>
    </Button>
  );
};

const IntroScreen = () => {
  const { onRequestClose, type, setActiveModal } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  return (
    <>
      <Modal.Header title={' '} showCloseButton={!isMobile}>
        <BuyCreditsButton onPlusClick={() => setActiveModal('BUY_CORES')} />
        {isMobile ? (
          <Button
            onClick={onRequestClose}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="mr-2"
          >
            Close
          </Button>
        ) : null}
      </Modal.Header>
      <Modal.Body className="bg-gradient-to-t from-theme-overlay-to to-transparent">
        {type !== 'USER' ? (
          <div className="mb-4 flex flex-col items-center justify-center gap-2 p-4">
            <Image
              src={cloudinaryAwardUnicorn}
              alt="Award unicorn"
              className="size-[7.5rem]"
            />
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
            >
              15 Awards given
            </Typography>
          </div>
        ) : undefined}
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Show your appreciation! Pick an Award to send to{' '}
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            tag={TypographyTag.Span}
            bold
          >
            John doe
          </Typography>
          !
        </Typography>
        <div className="mt-4 grid grid-cols-3 gap-2 tablet:grid-cols-4">
          {new Array(30).fill(null).map((item, i) => (
            /* eslint-disable react/no-array-index-key */
            <AwardItem key={i} />
          ))}
        </div>
      </Modal.Body>
    </>
  );
};

const CommentScreen = () => {
  const { setActiveStep } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <>
      <Modal.Header title="Give an Award" showCloseButton={!isMobile}>
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={() => setActiveStep('INTRO')}
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 flex flex-col items-center justify-center gap-2">
          <Image
            src={cloudinaryAwardUnicorn}
            alt="Award unicorn"
            className="size-[7.5rem]"
          />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            Awesome choice! We’re sure that{' '}
            <Typography
              bold
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              tag={TypographyTag.Span}
            >
              John doe
            </Typography>{' '}
            will appreciate this award!
          </Typography>
        </div>
        <form action="#" className="flex flex-1 flex-col">
          <MarkdownInput
            allowPreview={false}
            textareaProps={{
              name: 'content',
              rows: 6,
              placeholder:
                'Share a few words about why this Award is well deserved (optional)',
            }}
            className={{
              container: 'flex-1',
            }}
            initialContent=""
            enabledCommand={{ upload: false, link: false, mention: false }}
            showMarkdownGuide={false}
          />
        </form>
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col" justify={Justify.Center}>
        <Button className="w-full" variant={ButtonVariant.Primary}>
          Send Award for <CoinIcon /> 50
        </Button>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="text-center"
        >
          Awards may include a revenue share with the recipient and are subject
          to our{' '}
          <a
            href={termsOfService}
            target="_blank"
            rel="noopener"
            className="font-bold underline"
          >
            Terms of Service
          </a>
          .
        </Typography>
      </Modal.Footer>
    </>
  );
};

const ModalBody = () => {
  const { activeStep } = useGiveAwardModalContext();
  return (
    <>
      {activeStep === 'INTRO' ? <IntroScreen /> : null}
      {activeStep === 'COMMENT' ? <CommentScreen /> : null}
    </>
  );
};

const ModalRender = ({ ...props }: ModalProps) => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { activeModal, setActiveModal } = useGiveAwardModalContext();

  const onCompletion = useCallback(() => {
    setActiveModal('AWARD');
  }, [setActiveModal]);

  return (
    <>
      {activeModal === 'AWARD' ? (
        <Modal
          kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
          size={Modal.Size.Small}
          className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
          {...props}
        >
          <ModalBody />
        </Modal>
      ) : null}
      {activeModal === 'BUY_CORES' ? (
        <BuyCoresModal {...props} onCompletion={onCompletion} />
      ) : null}
    </>
  );
};

type GiveAwardModalProps = ModalProps & {
  type: AwardTypes;
};
const GiveAwardModal = ({
  type,
  ...props
}: GiveAwardModalProps): ReactElement => {
  return (
    <GiveAwardModalContextProvider
      onRequestClose={props.onRequestClose}
      type={type}
    >
      <ModalRender {...props} />
    </GiveAwardModalContextProvider>
  );
};

export default GiveAwardModal;
