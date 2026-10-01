import React, { useState } from 'react';
import type { ReactElement } from 'react';
import {
  useCreateOAuthClient,
  useDeleteOAuthClient,
  useDeleteOAuthConsent,
  useOAuthClients,
  useOAuthConsents,
  useRotateOAuthClientSecret,
  useUpdateOAuthClient,
} from '@dailydotdev/shared/src/hooks/api/useOAuthApps';
import {
  MAX_OAUTH_APPS_PER_USER,
  OAUTH_SCOPES,
  oauthEndpoints,
} from '@dailydotdev/shared/src/lib/oauthApps';
import type {
  OAuthClient,
  OAuthClientInput,
} from '@dailydotdev/shared/src/lib/oauthApps';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  PlusIcon,
  CopyIcon,
  TrashIcon,
  LockIcon,
  EditIcon,
  RefreshIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { ModalHeader } from '@dailydotdev/shared/src/components/modals/common/ModalHeader';
import { ModalBody } from '@dailydotdev/shared/src/components/modals/common/ModalBody';
import { ModalFooter } from '@dailydotdev/shared/src/components/modals/common/ModalFooter';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';

const OAUTH_APP_NAME_MAX_LENGTH = 50;
const OAUTH_REDIRECT_URIS_MAX_LENGTH = 2000;

const scopeLabels: Record<string, string> = {
  read: 'Read',
  write: 'Write',
};

const formatRelative = (value: Date): string =>
  formatDate({ value, type: TimeFormatType.PostUpdated });

const parseRedirectUris = (value: string): string[] =>
  value
    .split('\n')
    .map((uri) => uri.trim())
    .filter(Boolean);

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;

const AppLogo = ({ src }: { src?: string }): ReactElement | null => {
  const [failedSrc, setFailedSrc] = useState<string>();

  if (!src || failedSrc === src) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      className="size-10 shrink-0 rounded-10 object-cover"
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
};

interface OAuthClientModalProps {
  client: OAuthClient | null;
  onClose: () => void;
  onCreated: (client: OAuthClient) => void;
}

const OAuthClientModal = ({
  client,
  onClose,
  onCreated,
}: OAuthClientModalProps): ReactElement => {
  const isEdit = !!client;
  const [name, setName] = useState(client?.client_name ?? '');
  const [redirectUris, setRedirectUris] = useState(
    client?.redirect_uris.join('\n') ?? '',
  );
  const [homepage, setHomepage] = useState(client?.client_uri ?? '');
  const [logo, setLogo] = useState(client?.logo_uri ?? '');
  const { mutateAsync: createClient, isPending: isCreating } =
    useCreateOAuthClient();
  const { mutateAsync: updateClient, isPending: isUpdating } =
    useUpdateOAuthClient();
  const { displayToast } = useToastNotification();
  const uris = parseRedirectUris(redirectUris);
  const canSubmit = !!name.trim() && uris.length > 0;

  const handleSubmit = async () => {
    const input: OAuthClientInput = {
      client_name: name.trim(),
      redirect_uris: uris,
      ...(homepage.trim() && { client_uri: homepage.trim() }),
      ...(logo.trim() && { logo_uri: logo.trim() }),
    };

    try {
      if (client) {
        await updateClient({ clientId: client.client_id, update: input });
        displayToast('App updated');
        onClose();
        return;
      }

      onCreated(await createClient(input));
    } catch (err) {
      displayToast(
        getErrorMessage(err, 'Failed to save the app. Please try again.'),
      );
    }
  };

  return (
    <Modal isOpen onRequestClose={onClose} size={ModalSize.Small}>
      <ModalHeader title={isEdit ? 'Edit OAuth app' : 'Create OAuth app'} />
      <ModalBody className="flex flex-col gap-4">
        <TextField
          label="App name"
          inputId="oauth-app-name"
          name="client_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My daily.dev integration"
          maxLength={OAUTH_APP_NAME_MAX_LENGTH}
        />
        <div className="flex flex-col gap-2">
          <Textarea
            inputId="oauth-app-redirect-uris"
            label="Redirect URIs"
            name="redirect_uris"
            placeholder="https://example.com/callback"
            value={redirectUris}
            valueChanged={setRedirectUris}
            maxLength={OAUTH_REDIRECT_URIS_MAX_LENGTH}
            rows={3}
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            One URI per line. At least one is required.
          </Typography>
        </div>
        <TextField
          label="Homepage URL (optional)"
          inputId="oauth-app-homepage"
          name="client_uri"
          value={homepage}
          onChange={(e) => setHomepage(e.target.value)}
          placeholder="https://example.com"
        />
        <TextField
          label="Logo URL (optional)"
          inputId="oauth-app-logo"
          name="logo_uri"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={handleSubmit}
          loading={isCreating || isUpdating}
          disabled={!canSubmit}
        >
          {isEdit ? 'Save changes' : 'Create app'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface CredentialRowProps {
  label: string;
  value: string;
}

const CredentialRow = ({ label, value }: CredentialRowProps): ReactElement => {
  const [, copy] = useCopyText();

  return (
    <div className="flex flex-col gap-1">
      <Typography type={TypographyType.Footnote} bold>
        {label}
      </Typography>
      <div className="flex items-center gap-2 rounded-12 bg-surface-float p-3">
        <code className="min-w-0 flex-1 break-all text-text-primary">
          {value}
        </code>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<CopyIcon />}
          onClick={() =>
            copy({
              textToCopy: value,
              message: `${label} copied to clipboard`,
            })
          }
          className="shrink-0"
        />
      </div>
    </div>
  );
};

interface OAuthCredentialsModalProps {
  client: OAuthClient;
  title: string;
  onClose: () => void;
}

const OAuthCredentialsModal = ({
  client,
  title,
  onClose,
}: OAuthCredentialsModalProps): ReactElement => {
  return (
    <Modal isOpen onRequestClose={onClose} size={ModalSize.Small}>
      <ModalHeader title={title} />
      <ModalBody className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-12 bg-status-warning p-3">
          <LockIcon size={IconSize.Small} className="shrink-0" />
          <Typography type={TypographyType.Callout}>
            Copy the secret now. You can rotate it to get a new one.
          </Typography>
        </div>
        <CredentialRow label="Client ID" value={client.client_id} />
        {client.client_secret && (
          <CredentialRow label="Client secret" value={client.client_secret} />
        )}
        <CredentialRow label="Authorize URL" value={oauthEndpoints.authorize} />
        <CredentialRow label="Token URL" value={oauthEndpoints.token} />
        <CredentialRow
          label="REST API resource"
          value={oauthEndpoints.publicApiResource}
        />
        <CredentialRow
          label="MCP resource"
          value={oauthEndpoints.mcpResource}
        />
        <CredentialRow label="Scopes" value={OAUTH_SCOPES.join(' ')} />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          PKCE is required on every authorization request, on top of the client
          secret.
        </Typography>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={onClose}
        >
          I&apos;ve copied my secret
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface OAuthClientListItemProps {
  client: OAuthClient;
  onEdit: (client: OAuthClient) => void;
  onRotate: (client: OAuthClient) => void;
  onDelete: (client: OAuthClient) => void;
}

const OAuthClientListItem = ({
  client,
  onEdit,
  onRotate,
  onDelete,
}: OAuthClientListItemProps): ReactElement => {
  const [, copy] = useCopyText();

  return (
    <div className="flex items-start justify-between gap-2 rounded-12 border border-border-subtlest-tertiary p-4">
      <div className="flex min-w-0 flex-1 gap-3">
        <AppLogo src={client.logo_uri} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <Typography type={TypographyType.Body} bold className="truncate">
              {client.client_name || client.client_id}
            </Typography>
            {client.disabled && (
              <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 text-text-tertiary typo-footnote">
                Disabled
              </span>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-1 text-text-tertiary typo-footnote">
            <code className="truncate">{client.client_id}</code>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<CopyIcon />}
              onClick={() =>
                copy({
                  textToCopy: client.client_id,
                  message: 'Client ID copied to clipboard',
                })
              }
              className="shrink-0"
            />
          </div>
          {client.redirect_uris.map((uri) => (
            <span
              key={uri}
              className="break-all text-text-tertiary typo-footnote"
            >
              {uri}
            </span>
          ))}
          {client.client_id_issued_at && (
            <span className="text-text-tertiary typo-footnote">
              Created{' '}
              {formatRelative(new Date(client.client_id_issued_at * 1000))}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        {!client.disabled && (
          <>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<EditIcon />}
              onClick={() => onEdit(client)}
              aria-label="Edit app"
            />
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<RefreshIcon />}
              onClick={() => onRotate(client)}
              aria-label="Rotate secret"
            />
          </>
        )}
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<TrashIcon />}
          onClick={() => onDelete(client)}
          aria-label="Delete app"
        />
      </div>
    </div>
  );
};

type ClientModalState = { client: OAuthClient | null } | null;
type CredentialsState = { client: OAuthClient; title: string } | null;

export const OAuthAppsSection = (): ReactElement => {
  const { data: clients, isLoading, isError } = useOAuthClients();
  const { mutateAsync: rotateSecret } = useRotateOAuthClientSecret();
  const { mutateAsync: deleteClient } = useDeleteOAuthClient();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const [clientModal, setClientModal] = useState<ClientModalState>(null);
  const [credentials, setCredentials] = useState<CredentialsState>(null);

  const hasReachedLimit = (clients?.length ?? 0) >= MAX_OAUTH_APPS_PER_USER;

  const openCreate = () => setClientModal({ client: null });

  const handleRotate = async (client: OAuthClient) => {
    const confirmed = await showPrompt({
      title: 'Rotate client secret',
      description: `The current secret for ${
        client.client_name || client.client_id
      } stops working right away. Apps using it need the new one.`,
      okButton: { title: 'Rotate', className: 'btn-primary-ketchup' },
    });
    if (!confirmed) {
      return;
    }

    try {
      const rotated = await rotateSecret(client.client_id);
      setCredentials({ client: rotated, title: 'Secret rotated' });
    } catch (err) {
      displayToast(getErrorMessage(err, 'Failed to rotate the secret'));
    }
  };

  const handleDelete = async (client: OAuthClient) => {
    const confirmed = await showPrompt({
      title: 'Delete OAuth app',
      description: `Deleting ${
        client.client_name || client.client_id
      } disconnects every user who signed in with it. This can't be undone.`,
      okButton: { title: 'Delete', className: 'btn-primary-ketchup' },
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteClient(client.client_id);
      displayToast('App deleted');
    } catch (err) {
      displayToast(getErrorMessage(err, 'Failed to delete the app'));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            OAuth apps
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Register apps that let people sign in with daily.dev and act on
            their behalf.
          </Typography>
        </div>
        <Tooltip
          content={
            hasReachedLimit && "You've reached the maximum number of OAuth apps"
          }
        >
          <div className="shrink-0">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={openCreate}
              disabled={hasReachedLimit}
            >
              Create app
            </Button>
          </div>
        </Tooltip>
      </div>

      {isLoading && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Loading apps...
        </Typography>
      )}

      {!isLoading && clients && clients.length > 0 && (
        <div className="flex flex-col gap-3">
          {clients.map((client) => (
            <OAuthClientListItem
              key={client.client_id}
              client={client}
              onEdit={(item) => setClientModal({ client: item })}
              onRotate={handleRotate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isError && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Couldn&apos;t load your apps. Try again later.
        </Typography>
      )}

      {!isLoading && !isError && (!clients || clients.length === 0) && (
        <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-6">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            No OAuth apps yet.
          </Typography>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={openCreate}
          >
            Create your first app
          </Button>
        </div>
      )}

      {clientModal && (
        <OAuthClientModal
          client={clientModal.client}
          onClose={() => setClientModal(null)}
          onCreated={(client) => {
            setClientModal(null);
            setCredentials({ client, title: 'App created' });
          }}
        />
      )}

      {credentials && (
        <OAuthCredentialsModal
          client={credentials.client}
          title={credentials.title}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
};

export const ConnectedAppsSection = (): ReactElement => {
  const { data: consents, isLoading, isError } = useOAuthConsents();
  const { mutateAsync: deleteConsent } = useDeleteOAuthConsent();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const handleDisconnect = async (id: string, appName: string) => {
    const confirmed = await showPrompt({
      title: 'Disconnect app',
      description: `${appName} will lose access to your daily.dev account.`,
      okButton: { title: 'Disconnect', className: 'btn-primary-ketchup' },
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteConsent(id);
      displayToast('App disconnected');
    } catch (err) {
      displayToast(getErrorMessage(err, 'Failed to disconnect the app'));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Body} bold>
          Connected apps
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Apps you have allowed to access your daily.dev account.
        </Typography>
      </div>

      {isLoading && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Loading connected apps...
        </Typography>
      )}

      {!isLoading && consents && consents.length > 0 && (
        <div className="flex flex-col gap-3">
          {consents.map((consent) => {
            const appName = consent.isClientDisabled
              ? 'Disabled app'
              : consent.client?.client_name || consent.clientId;
            const scopes = consent.scopes
              .map((scope) => scopeLabels[scope])
              .filter(Boolean);

            return (
              <div
                key={consent.id}
                className="flex items-center justify-between gap-2 rounded-12 border border-border-subtlest-tertiary p-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <AppLogo src={consent.client?.logo_uri} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Typography
                      type={TypographyType.Body}
                      bold
                      className="truncate"
                    >
                      {appName}
                    </Typography>
                    <div className="flex flex-wrap gap-x-1 text-text-tertiary typo-footnote">
                      {scopes.length > 0 && (
                        <>
                          <span>{scopes.join(', ')}</span>
                          <span>&#x2022;</span>
                        </>
                      )}
                      <span>
                        Connected {formatRelative(new Date(consent.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant={ButtonVariant.Secondary}
                  size={ButtonSize.Small}
                  onClick={() => handleDisconnect(consent.id, appName)}
                  className="shrink-0"
                >
                  Disconnect
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {isError && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Couldn&apos;t load your connected apps. Try again later.
        </Typography>
      )}

      {!isLoading && !isError && (!consents || consents.length === 0) && (
        <div className="flex flex-col items-center rounded-16 border border-border-subtlest-tertiary p-6">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            No apps connected yet.
          </Typography>
        </div>
      )}
    </div>
  );
};
