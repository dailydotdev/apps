import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { FlexCol } from '../../utilities';
import { TextField } from '../../fields/TextField';
import { useCreateSharedSlackChannel } from '../../../hooks/integrations/slack/useCreateSharedSlackChannel';
import Alert, { AlertType } from '../../widgets/Alert';

export type SlackChannelConfirmationModalProps = ModalProps & {
  name: string;
  email: string;
  channelName: string;
  organizationId?: string;
};

const generateChannelName = (name: string): string => {
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);

  return `dailydev-${sanitizedName}`;
};

export const SlackChannelConfirmationModal = ({
  name,
  email,
  channelName,
  organizationId,
  onRequestClose,
  ...modalProps
}: SlackChannelConfirmationModalProps): ReactElement => {
  const { createChannel, isCreating } = useCreateSharedSlackChannel();
  const [localName, setLocalName] = useState(name);
  const [localEmail, setLocalEmail] = useState(email);
  const [error, setError] = useState<string | null>(null);

  const currentChannelName = useMemo(
    () => generateChannelName(localName || 'user'),
    [localName],
  );

  const handleConfirm = async () => {
    setError(null);

    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }

    try {
      await createChannel({
        email: localEmail,
        channelName: currentChannelName,
        organizationId,
      });
      onRequestClose(null);
    } catch (err) {
      setError(
        err?.response?.errors?.[0]?.message ||
          'Failed to create Slack channel.',
      );
    }
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={!isCreating}
    >
      <Modal.Header>
        <Typography type={TypographyType.Title2} bold>
          Connect to Slack
        </Typography>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4 p-6">
        <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
          Please confirm your information before we create a shared Slack
          channel for you.
        </Typography>

        <FlexCol className="gap-3">
          {error && (
            <Alert type={AlertType.Error} flexDirection="flex-row">
              {error}
            </Alert>
          )}

          <TextField
            label="Name"
            inputId="slack-name"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            disabled={isCreating}
          />

          <TextField
            label="Email"
            inputId="slack-email"
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            disabled={isCreating}
          />

          <div className="rounded-12 bg-surface-float p-3">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Channel name: <strong>{currentChannelName}</strong>
            </Typography>
          </div>
        </FlexCol>
      </Modal.Body>
      <Modal.Footer className="flex gap-3 p-6">
        <Button
          variant={ButtonVariant.Secondary}
          onClick={() => onRequestClose(null)}
          disabled={isCreating}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          onClick={handleConfirm}
          loading={isCreating}
          disabled={isCreating || !localName || !localEmail}
          className="flex-1"
        >
          Connect Slack
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SlackChannelConfirmationModal;
