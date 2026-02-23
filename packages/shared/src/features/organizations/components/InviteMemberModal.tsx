import type { ReactElement } from 'react';
import React from 'react';

import type { ModalProps } from '../../../components/modals/common/Modal';
import { Modal } from '../../../components/modals/common/Modal';
import {
  LazyModal,
  ModalHeaderKind,
  ModalSize,
} from '../../../components/modals/common/types';
import { useOrganization } from '../hooks/useOrganization';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { TextField } from '../../../components/fields/TextField';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { LinkIcon } from '../../../components/icons';
import { useCopyLink } from '../../../hooks/useCopy';
import { useViewSize, ViewSize } from '../../../hooks';
import { HorizontalSeparator } from '../../../components/utilities';
import { useLazyModal } from '../../../hooks/useLazyModal';

type Props = ModalProps & {
  organizationId?: string;
};

export const InviteMemberModal = ({
  organizationId,
  ...props
}: Props): ReactElement => {
  const [isCopying, copyLink] = useCopyLink();
  const { openModal } = useLazyModal();

  const { organization, referralUrl, seats } = useOrganization(organizationId);

  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <Modal {...props} size={ModalSize.Small}>
      <Modal.Header
        kind={isMobile ? ModalHeaderKind.Secondary : ModalHeaderKind.Primary}
        className="truncate"
        title={`Invite members to ${organization.name}`}
      />
      <Modal.Body className="flex gap-4 tablet:justify-center">
        {seats.available ? (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            You have {seats.available} {seats.available > 1 ? 'seats' : 'seat'}{' '}
            available
          </Typography>
        ) : (
          <>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              No available seats left.
              <br />
              <br />
              You don&apos;t have any available seats in your organization.
            </Typography>

            <Button
              variant={ButtonVariant.Primary}
              className="self-start"
              onClick={() => {
                openModal({
                  type: LazyModal.OrganizationManageSeats,
                  props: {
                    organizationId: organization.id,
                    onAfterClose: () => {
                      openModal({
                        type: LazyModal.OrganizationInviteMember,
                        props: {
                          organizationId: organization.id,
                        },
                      });
                    },
                  },
                });
              }}
            >
              Add more seats
            </Button>

            <HorizontalSeparator />
          </>
        )}

        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          This organization is private. Only invited members can access it and
          benefit from daily.dev Plus. Share your invitation link to add members
          to your organization.
        </Typography>

        <TextField
          label={null}
          inputId="referralUrl"
          value={referralUrl}
          name="referralUrl"
          readOnly
        />

        <Button
          variant={ButtonVariant.Primary}
          icon={<LinkIcon />}
          pressed={isCopying}
          onClick={() => copyLink({ link: referralUrl })}
        >
          {isCopying ? 'Copied!' : 'Copy link'}
        </Button>
      </Modal.Body>
    </Modal>
  );
};
