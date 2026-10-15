import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../../../../components/modals/common/Modal';
import {
  LazyModal,
  ModalSize,
} from '../../../../components/modals/common/types';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { FlagIcon } from '../../../../components/icons/Flag';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import type { DmPeer } from '../../../messages/types';
import { getFirstName } from '../../lib/format';

// The buttons sit in the body: a phone sheet has no footer.
export const LfgRepoLinkWarning = ({
  url,
  peer,
  onClose,
}: {
  url: string;
  peer: Pick<DmPeer, 'id' | 'name' | 'username'>;
  onClose: () => void;
}): ReactElement => {
  const { openModal } = useLazyModal();
  const first = getFirstName(peer.name);

  return (
    <Modal
      isOpen
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onClose}
    >
      <Modal.Header title="Before you open this" />
      <Modal.Body className="flex flex-col gap-3">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          You met {first} through Looking for group. Fake job and co-founder
          offers often ask people to clone a repo and run it, which can install
          malware that steals passwords, keys and wallets.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Read the code before you run anything, and never run a stranger&apos;s
          install scripts on your own machine.
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="break-all"
        >
          {url}
        </Typography>
        <div className="mt-2 flex justify-end gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            icon={<FlagIcon />}
            onClick={() => {
              onClose();
              openModal({
                type: LazyModal.ReportUser,
                props: {
                  offendingUser: { id: peer.id, username: peer.username },
                },
              });
            }}
          >
            Report {first}
          </Button>
          <Button
            tag="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            variant={ButtonVariant.Secondary}
            onClick={onClose}
          >
            Open anyway
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
