import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Modal } from '../../../components/modals/common/Modal';
import { CopyIcon } from '../../../components/icons/Copy';
import { TerminalIcon } from '../../../components/icons/Terminal';
import { VIcon } from '../../../components/icons/V';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { mcpServerDocs } from '../../../lib/constants';
import { LogEvent, Origin } from '../../../lib/log';
import {
  mcpClaudeInstallCommand,
  oauthEndpoints,
} from '../../../lib/oauthApps';
import { anchorDefaultRel } from '../../../lib/strings';

const starterPrompt =
  'Review my daily.dev feed settings and suggest changes. Ask me before you apply any.';

enum AgentSetupMethod {
  Setup = 'setup',
  CopyCommand = 'copy_command',
  CopyUrl = 'copy_url',
  CopyPrompt = 'copy_prompt',
  Docs = 'docs',
}

const useLogAgentSetup = (): ((method: AgentSetupMethod) => void) => {
  const { logEvent } = useLogContext();

  return (method) =>
    logEvent({
      event_name: LogEvent.ClickConnectAgent,
      extra: JSON.stringify({ origin: Origin.Settings, method }),
    });
};

const CopyBlock = ({
  label,
  text,
  isCode,
  onCopy,
}: {
  label: string;
  text: string;
  isCode?: boolean;
  onCopy: () => void;
}): ReactElement => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }
    const timeout = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  return (
    <div className="flex flex-col gap-1.5">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
      <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
        <span
          className={classNames(
            'min-w-0 flex-1 whitespace-pre-wrap break-words typo-footnote',
            isCode ? 'font-mono text-text-secondary' : 'text-text-primary',
          )}
        >
          {text}
        </span>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={isCopied ? <VIcon /> : <CopyIcon />}
          aria-label={isCopied ? 'Copied' : `Copy: ${label}`}
          className="-my-1 shrink-0"
          onClick={() => {
            navigator.clipboard?.writeText(text);
            setIsCopied(true);
            onCopy();
          }}
        />
      </div>
    </div>
  );
};

const Step = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex gap-3">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-surface-float font-bold text-text-secondary typo-footnote">
      {number}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
        {title}
      </Typography>
      {children}
    </div>
  </section>
);

const AgentSetupModal = ({
  onClose,
}: {
  onClose: () => void;
}): ReactElement => {
  const logSetup = useLogAgentSetup();

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      isDrawerOnMobile
      onRequestClose={onClose}
    >
      <Modal.Header title="Connect your AI agent" />
      <Modal.Body className="flex flex-col gap-6">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Add the daily.dev MCP server to Claude, Cursor, Codex or any MCP
          client. Your agent can then read and change your For You settings.
        </Typography>
        <Step number={1} title="Add the MCP server">
          <CopyBlock
            label="In Claude Code"
            text={mcpClaudeInstallCommand}
            isCode
            onCopy={() => logSetup(AgentSetupMethod.CopyCommand)}
          />
          <CopyBlock
            label="In any other MCP client, add this server and sign in when asked"
            text={oauthEndpoints.mcpResource}
            isCode
            onCopy={() => logSetup(AgentSetupMethod.CopyUrl)}
          />
        </Step>
        <Step number={2} title="Ask for what you want">
          <CopyBlock
            label="Start with this, or ask for something specific"
            text={starterPrompt}
            onCopy={() => logSetup(AgentSetupMethod.CopyPrompt)}
          />
        </Step>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Every change it makes shows up in these settings, and you can undo any
          of it.{' '}
          <a
            href={mcpServerDocs}
            target="_blank"
            rel={anchorDefaultRel}
            className="text-text-link hover:underline"
            onClick={() => logSetup(AgentSetupMethod.Docs)}
          >
            Setup guide
          </a>
        </Typography>
      </Modal.Body>
    </Modal>
  );
};

/** The daily.dev MCP server, which changes these settings from an agent. */
export const AgentSetup = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const logSetup = useLogAgentSetup();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Body}>
          Connect your AI agent
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Tell it what you want from your feed and it changes these settings for
          you.
        </Typography>
      </div>
      <Button
        type="button"
        className="self-start"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Small}
        icon={<TerminalIcon />}
        onClick={() => {
          setIsOpen(true);
          logSetup(AgentSetupMethod.Setup);
        }}
      >
        Connect your agent
      </Button>
      {isOpen && <AgentSetupModal onClose={() => setIsOpen(false)} />}
    </div>
  );
};
