import type { ReactElement } from 'react';
import React, { useState } from 'react';

import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';

const SCREENS = {
  INTRO: 'INTRO',
  COMMENT: 'COMMENT',
  SHOW_ALL: 'SHOW_ALL',
} as const;

type Screens = keyof typeof SCREENS;
type SharedScreenProps = {
  setActiveStep: (step: Screens) => void;
};

const IntroScreen = ({ setActiveStep }: SharedScreenProps) => {
  return (
    <>
      <Modal.Header title="Give an Award" />
      <Modal.Body>
        <div className="mb-4 flex items-center justify-center p-4">
          <Button
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Float}
            onClick={() => setActiveStep(SCREENS.SHOW_ALL)}
          >
            See all →
          </Button>
        </div>
        <Typography type={TypographyType.Callout} className="text-center">
          Show your appreciation! Pick an Award to send to{' '}
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Credit}
            tag={TypographyTag.Span}
          >
            John doe
          </Typography>
          !
        </Typography>
      </Modal.Body>
    </>
  );
};

const CommentScreen = ({ setActiveStep }: SharedScreenProps) => {
  return (
    <>
      <Modal.Header title="Give an Award" />
      <Modal.Body>
        <Typography type={TypographyType.Callout} className="text-center">
          Leave a comment
        </Typography>
      </Modal.Body>
    </>
  );
};

const ShowAllScreen = ({ setActiveStep }: SharedScreenProps) => {
  return (
    <>
      <Modal.Header title="Give award">
        <Button
          onClick={() => setActiveStep(SCREENS.INTRO)}
          size={ButtonSize.Small}
          className="flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body>
        <Typography type={TypographyType.Callout} className="text-center">
          SHOW_ALL
        </Typography>
      </Modal.Body>
    </>
  );
};

const GiveAwardModal = ({ ...props }: ModalProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<Screens>(SCREENS.INTRO);
  const sharedProps = {
    setActiveStep,
  };
  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...props}>
      {activeStep === SCREENS.INTRO ? <IntroScreen {...sharedProps} /> : null}
      {activeStep === SCREENS.COMMENT ? (
        <CommentScreen {...sharedProps} />
      ) : null}
      {activeStep === SCREENS.SHOW_ALL ? (
        <ShowAllScreen {...sharedProps} />
      ) : null}
    </Modal>
  );
};

export default GiveAwardModal;
