import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Modal } from '../../../../components/modals/common/Modal';
import { ModalSize } from '../../../../components/modals/common/types';
import { IconSize } from '../../../../components/Icon';
import { VolunteeringIcon } from '../../../../components/icons/Volunteering';
import { RaiseHandIcon } from '../../../../components/icons/RaiseHand';
import { ShieldCheckIcon } from '../../../../components/icons/ShieldCheck';

const rules: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <VolunteeringIcon size={IconSize.Small} secondary />,
    title: 'No paid work',
    body: "Don't post or pitch gigs, hiring or services for sale. Equity between co-founders is fine.",
  },
  {
    icon: <RaiseHandIcon size={IconSize.Small} secondary />,
    title: 'Be specific',
    body: 'Say what you need and a bit about yourself. Go through the requests you get, even if the answer is no.',
  },
  {
    icon: <ShieldCheckIcon size={IconSize.Small} secondary />,
    title: 'Stay safe',
    body: "Keep chats on daily.dev until you trust someone. Never pay to join, and never run code you haven't read.",
  },
];

// Agreed once, before a first post; the API keeps the pledge.
export const LfgHouseRulesModal = ({
  isPending,
  onAgree,
  onClose,
}: {
  isPending: boolean;
  onAgree: () => void;
  onClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    isDrawerOnMobile
    size={ModalSize.Small}
    onRequestClose={onClose}
    // A phone's sheet pins the publish button under the thumb.
    formProps={{
      form: '',
      title: 'Before you post',
      copy: { right: "I'm in, publish" },
      rightButtonProps: {
        type: 'button',
        loading: isPending,
        onClick: onAgree,
      },
    }}
  >
    <Modal.Header title="Before you post" />
    <Modal.Body className="flex flex-col gap-4">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Looking for group is for finding people, not customers.
      </Typography>
      {rules.map((rule) => (
        <div key={rule.title} className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-accent-avocado-default">
            {rule.icon}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography type={TypographyType.Callout} bold>
              {rule.title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {rule.body}
            </Typography>
          </span>
        </div>
      ))}
    </Modal.Body>
    <Modal.Footer>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        disabled={isPending}
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        loading={isPending}
        onClick={onAgree}
      >
        I&apos;m in, publish
      </Button>
    </Modal.Footer>
  </Modal>
);
