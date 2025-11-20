import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import { TextField } from '../../fields/TextField';
import { MagicIcon, ShieldIcon } from '../../icons';
import { webappUrl } from '../../../lib/constants';
import Link from '../../utilities/Link';

export interface RecruiterJobLinkModalProps extends ModalProps {
  onSubmit: (jobLink: string) => void;
}

export const RecruiterJobLinkModal = ({
  onSubmit,
  onRequestClose,
  ...modalProps
}: RecruiterJobLinkModalProps): ReactElement => {
  const [jobLink, setJobLink] = useState('');

  const handleSubmit = () => {
    if (jobLink.trim()) {
      onSubmit(jobLink.trim());
    }
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Body className="flex flex-col items-center gap-6 p-6 !py-10">
        <div className="mx-auto flex items-center justify-center gap-3 rounded-12 bg-brand-float px-4 py-1">
          <MagicIcon className="text-brand-default" />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Brand}
          >
            Something magical in 3...2...1...
          </Typography>
        </div>

        <Typography type={TypographyType.Title1} bold center>
          Find out who&#39;s ready to say yes
        </Typography>

        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          center
        >
          Your role is matched privately inside daily.dev&#39;s developer
          network
        </Typography>

        <div className="flex w-full flex-col gap-4">
          <Typography type={TypographyType.Body} bold center>
            Drop your job link
          </Typography>

          <TextField
            label="job link"
            inputId="job-link"
            name="job-link"
            placeholder="https://yourcompany.com/careers/senior-engineer"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
          />

          <Link passHref href={`${webappUrl}`}>
            <a className="mb-8 text-center text-text-secondary underline typo-callout">
              Or upload PDF
            </a>
          </Link>

          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            onClick={handleSubmit}
            disabled={!jobLink.trim()}
            className="w-full gap-2 tablet:w-auto"
          >
            <MagicIcon /> Find my matches
          </Button>

          <div className="flex items-center justify-center gap-2">
            <ShieldIcon className="text-text-secondary" />
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
              center
            >
              Built on trust, not scraping. Every match is fully opt-in.
            </Typography>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="!justify-center bg-surface-float">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
          center
        >
          See real developer introductions in hours, not weeks.
        </Typography>
      </Modal.Footer>
    </Modal>
  );
};

export default RecruiterJobLinkModal;
