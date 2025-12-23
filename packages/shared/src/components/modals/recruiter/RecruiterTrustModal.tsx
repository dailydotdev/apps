import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Typography, TypographyType } from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { Checkbox } from '../../fields/Checkbox';
import { ShieldIcon } from '../../icons';
import Link from '../../utilities/Link';
import { stateOfTrust } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

export interface RecruiterTrustModalProps extends ModalProps {
  onNext: () => void;
}

export const RecruiterTrustModal = ({
  onNext,
  onRequestClose,
  ...modalProps
}: RecruiterTrustModalProps): ReactElement => {
  const [trustAgreed, setTrustAgreed] = useState(false);

  const handleNext = () => {
    if (trustAgreed) {
      onNext();
    }
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
    >
      <Modal.Body className="flex flex-col gap-6 p-6">
        <div className="mr-auto flex items-center gap-3 rounded-12 bg-accent-water-flat px-3 py-1">
          <ShieldIcon className="text-accent-water-bolder" />
          <Typography
            type={TypographyType.Footnote}
            className="text-accent-water-default"
          >
            Before you post your first role
          </Typography>
        </div>

        <Typography type={TypographyType.Title1} bold>
          When you hire on daily.dev, you inherit the trust developers already
          gave us
        </Typography>

        <div className="flex flex-col gap-4">
          <Typography type={TypographyType.Body}>Your commitments:</Typography>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-12 bg-accent-water-bolder text-surface-invert">
                <Typography type={TypographyType.Callout} bold>
                  1
                </Typography>
              </div>
              <Typography type={TypographyType.Body}>
                <span className="font-bold">Be honest:</span> real salary
                ranges, real requirements, real roles
              </Typography>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-12 bg-accent-water-bolder text-surface-invert">
                <Typography type={TypographyType.Callout} bold>
                  2
                </Typography>
              </div>
              <Typography type={TypographyType.Body}>
                <span className="font-bold">Be reliable:</span> if a developer
                replies, you reply. Always
              </Typography>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-12 bg-accent-water-bolder text-surface-invert">
                <Typography type={TypographyType.Callout} bold>
                  3
                </Typography>
              </div>
              <Typography type={TypographyType.Body}>
                <span className="font-bold">Be respectful:</span> these are
                professionals, not leads to chase
              </Typography>
            </div>
          </div>

          <div className="mr-auto flex items-center gap-3 rounded-12 bg-accent-water-flat px-3 py-1">
            <Typography
              type={TypographyType.Callout}
              className="text-accent-water-default"
            >
              Do this, and you&#39;ll wonder why tech recruiting was ever so
              hard.
            </Typography>
          </div>

          <Checkbox
            name="trust-agreement"
            checked={trustAgreed}
            onToggleCallback={(checked) => setTrustAgreed(checked)}
            className="mt-2"
          >
            I agree to honor the trust developers have placed in daily.dev
          </Checkbox>

          <Button
            variant={ButtonVariant.Primary}
            onClick={handleNext}
            disabled={!trustAgreed}
            className="w-full tablet:w-auto"
          >
            Agree
          </Button>

          <Link passHref href={stateOfTrust}>
            <a
              className="text-center text-text-secondary underline typo-callout"
              target="_blank"
              rel={anchorDefaultRel}
            >
              Help me understand why trust matters here
            </a>
          </Link>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RecruiterTrustModal;
