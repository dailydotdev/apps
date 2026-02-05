import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  usePlusSubscription,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import {
  usePersonalAccessTokens,
  useCreatePersonalAccessToken,
  useRevokePersonalAccessToken,
} from '@dailydotdev/shared/src/hooks/api/usePersonalAccessTokens';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
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
import {
  PlusIcon,
  CopyIcon,
  TrashIcon,
  LockIcon,
  DocsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { ModalHeader } from '@dailydotdev/shared/src/components/modals/common/ModalHeader';
import { ModalBody } from '@dailydotdev/shared/src/components/modals/common/ModalBody';
import { ModalFooter } from '@dailydotdev/shared/src/components/modals/common/ModalFooter';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('API Access'),
};

const SKILL_INSTRUCTION =
  'Install the daily-dev skill from clawdhub and explain my new superpowers';
const OPENAPI_URL = 'https://api.daily.dev/public/v1/docs/json';
const CLAUDE_INSTALL_COMMAND = [
  `claude plugin marketplace add https://github.com/dailydotdev/daily.git`,
  `claude plugin install daily.dev@daily.dev`,
  `claude "/daily.dev setup"`,
];

const CURSOR_REPO_URL = 'https://github.com/dailydotdev/daily.git';
const CODEX_INSTALL_COMMAND = `$skill-installer install the daily.dev skill from ${CURSOR_REPO_URL}`;

const lowercaseRelativeDate = (dateStr: string): string => {
  const relativeDates = ['Now', 'Today', 'Yesterday'];
  return relativeDates.includes(dateStr) ? dateStr.toLowerCase() : dateStr;
};

const ExpirationOptions = [
  { value: '', label: 'Never expires' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
];

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const CreateTokenModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateTokenModalProps): ReactElement => {
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState('');
  const { mutateAsync: createToken, isPending } =
    useCreatePersonalAccessToken();
  const { displayToast } = useToastNotification();

  const handleCreate = async () => {
    if (!name.trim()) {
      displayToast('Please enter a token name');
      return;
    }

    try {
      const result = await createToken({
        name: name.trim(),
        expiresInDays: expiration ? parseInt(expiration, 10) : null,
      });
      onSuccess(result.token);
      setName('');
      setExpiration('');
    } catch {
      displayToast('Failed to create token. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} size={ModalSize.Small}>
      <ModalHeader title="Create API Token" />
      <ModalBody className="flex flex-col gap-4">
        <TextField
          label="Token name"
          inputId="token-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My AI Agent"
          maxLength={50}
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Expiration
          </Typography>
          <Radio
            name="expiration"
            value={expiration}
            onChange={setExpiration}
            options={ExpirationOptions}
          />
        </div>
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
          onClick={handleCreate}
          loading={isPending}
          disabled={!name.trim()}
        >
          Create token
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface TokenCreatedModalProps {
  isOpen: boolean;
  token: string;
  onClose: () => void;
}

const TokenCreatedModal = ({
  isOpen,
  token,
  onClose,
}: TokenCreatedModalProps): ReactElement => {
  const { displayToast } = useToastNotification();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      displayToast('Token copied to clipboard');
    } catch {
      displayToast('Failed to copy token');
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} size={ModalSize.Small}>
      <ModalHeader title="Token created" />
      <ModalBody className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-12 bg-status-warning p-3">
          <LockIcon size={IconSize.Small} className="shrink-0" />
          <Typography type={TypographyType.Callout}>
            This token will only be shown once.
            <br />
            Copy it now!
          </Typography>
        </div>
        <div className="flex items-center gap-2 rounded-12 bg-surface-float p-3">
          <code className="flex-1 break-all text-text-primary">{token}</code>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<CopyIcon />}
            onClick={handleCopy}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={onClose}
        >
          I&apos;ve copied my token
        </Button>
      </ModalFooter>
    </Modal>
  );
};

interface TokenListItemProps {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  onRevoke: (id: string) => void;
}

const TokenListItem = ({
  id,
  name,
  tokenPrefix,
  createdAt,
  lastUsedAt,
  onRevoke,
}: TokenListItemProps): ReactElement => {
  return (
    <div className="flex items-start justify-between gap-2 rounded-12 border border-border-subtlest-tertiary p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography type={TypographyType.Body} bold className="truncate">
          {name}
        </Typography>
        <div className="flex flex-wrap gap-x-1 text-text-tertiary typo-footnote">
          <span>{tokenPrefix}...</span>
          <span>&#x2022;</span>
          <span>
            Created{' '}
            {lowercaseRelativeDate(
              formatDate({ value: createdAt, type: TimeFormatType.Post }),
            )}
          </span>
          {lastUsedAt && (
            <>
              <span>&#x2022;</span>
              <span>
                Last used{' '}
                {lowercaseRelativeDate(
                  formatDate({
                    value: lastUsedAt,
                    type: TimeFormatType.Post,
                  }),
                )}
              </span>
            </>
          )}
        </div>
      </div>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<TrashIcon />}
        onClick={() => onRevoke(id)}
        className="shrink-0"
      />
    </div>
  );
};

const ApiAccessPage = (): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { data: tokens, isLoading } = usePersonalAccessTokens();
  const { mutateAsync: revokeToken } = useRevokePersonalAccessToken();
  const { displayToast } = useToastNotification();
  const isMobile = useViewSize(ViewSize.MobileL);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const handleCopyInstruction = async () => {
    try {
      await navigator.clipboard.writeText(SKILL_INSTRUCTION);
      displayToast('Instruction copied to clipboard');
    } catch {
      displayToast('Failed to copy');
    }
  };

  const handleCopyClaudeCommand = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_INSTALL_COMMAND.join(' && '));
      displayToast('Command copied to clipboard');
    } catch {
      displayToast('Failed to copy');
    }
  };

  const handleCopyCodexCommand = async () => {
    try {
      await navigator.clipboard.writeText(CODEX_INSTALL_COMMAND);
      displayToast('Command copied to clipboard');
    } catch {
      displayToast('Failed to copy');
    }
  };

  const handleCopyCursorUrl = async () => {
    try {
      await navigator.clipboard.writeText(CURSOR_REPO_URL);
      displayToast('URL copied to clipboard');
    } catch {
      displayToast('Failed to copy');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeToken(id);
      displayToast('Token revoked successfully');
    } catch {
      displayToast('Failed to revoke token');
    }
  };

  if (!isPlus) {
    return (
      <AccountPageContainer title="API Access">
        <div className="flex flex-col gap-4">
          <Typography type={TypographyType.Body} bold>
            Plus Feature
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            API access is available exclusively for Plus subscribers. Upgrade to
            connect AI agents and automate your workflows.
          </Typography>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            tag="a"
            href="/plus"
            className="self-start"
          >
            Upgrade to Plus
          </Button>
        </div>
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer
      title="API Access"
      actions={
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
          onClick={() => setShowCreateModal(true)}
        >
          {isMobile ? undefined : 'Create token'}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Personal Access Tokens
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Use tokens to authenticate with the daily.dev API. Tokens provide
            read-only access to your personalized feed and posts.
          </Typography>
        </div>

        {isLoading && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Loading tokens...
          </Typography>
        )}

        {!isLoading && tokens && tokens.length > 0 && (
          <div className="flex flex-col gap-3">
            {tokens.map((token) => (
              <TokenListItem
                key={token.id}
                id={token.id}
                name={token.name}
                tokenPrefix={token.tokenPrefix}
                createdAt={new Date(token.createdAt)}
                lastUsedAt={
                  token.lastUsedAt ? new Date(token.lastUsedAt) : null
                }
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        )}

        {!isLoading && (!tokens || tokens.length === 0) && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              No tokens yet. Create one to get started.
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={() => setShowCreateModal(true)}
            >
              Create your first token
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Connect OpenClaw
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Copy this instruction to your agent to get started:
          </Typography>
          <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
            <code className="min-w-0 flex-1 break-words text-text-tertiary">
              {SKILL_INSTRUCTION}
            </code>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<CopyIcon />}
              onClick={handleCopyInstruction}
              className="shrink-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Claude Code Integration
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Add daily.dev to Claude Code as a plugin with below commands:
          </Typography>
          <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
            <code className="min-w-0 flex-1 whitespace-pre-wrap break-words text-text-tertiary">
              {CLAUDE_INSTALL_COMMAND.join('\n')}
            </code>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<CopyIcon />}
              onClick={handleCopyClaudeCommand}
              className="shrink-0"
            />
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            After that you can use skill <strong>/daily.dev</strong> to interact
            with your daily.dev feed and other features.
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Codex Integration
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Install the daily.dev skill in Codex with this command:
          </Typography>
          <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
            <code className="min-w-0 flex-1 break-words text-text-tertiary">
              {CODEX_INSTALL_COMMAND}
            </code>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<CopyIcon />}
              onClick={handleCopyCodexCommand}
              className="shrink-0"
            />
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Restart Codex after installation, then use{' '}
            <strong>$daily.dev</strong> to interact with your feed.
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Cursor Integration
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Add daily.dev as a remote skill in Cursor:
          </Typography>
          <ol className="list-inside list-decimal text-text-tertiary typo-callout">
            <li>
              Open Cursor Settings → Rules (Cmd+Shift+J on Mac, Ctrl+Shift+J on
              Windows/Linux)
            </li>
            <li>
              Click &quot;Add Rule&quot; → &quot;Remote Rule (Github)&quot;
            </li>
            <li>Enter the repository URL below</li>
          </ol>
          <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
            <code className="min-w-0 flex-1 break-words text-text-tertiary">
              {CURSOR_REPO_URL}
            </code>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<CopyIcon />}
              onClick={handleCopyCursorUrl}
              className="shrink-0"
            />
          </div>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Use <strong>/daily.dev</strong> in Agent chat to interact with your
            feed.
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Body} bold>
            Documentation
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Learn how to use the API and explore available endpoints.
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<DocsIcon />}
              tag="a"
              href="https://docs.daily.dev/docs/plus/public-api"
              target="_blank"
            >
              API Docs
            </Button>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<DocsIcon />}
              tag="a"
              href={OPENAPI_URL}
              target="_blank"
            >
              OpenAPI Reference
            </Button>
          </div>
        </div>
      </div>

      <CreateTokenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(token) => {
          setShowCreateModal(false);
          setCreatedToken(token);
        }}
      />

      <TokenCreatedModal
        isOpen={!!createdToken}
        token={createdToken || ''}
        onClose={() => setCreatedToken(null)}
      />
    </AccountPageContainer>
  );
};

ApiAccessPage.getLayout = getSettingsLayout;
ApiAccessPage.layoutProps = { seo };

export default ApiAccessPage;
