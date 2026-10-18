import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { mcpServerDocs } from '@dailydotdev/shared/src/lib/constants';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';

// The app reads this from `oauthEndpoints.mcpResource`; Storybook has no API URL.
const mcpServerUrl = 'https://api.daily.dev/mcp';
const claudeCodeCommand = `claude mcp add --transport http daily.dev ${mcpServerUrl}`;
const starterPrompt =
  'Review my daily.dev feed settings and suggest changes. Ask me before you apply any.';

const CopyBlock = ({
  label,
  text,
  isCode,
}: {
  label: string;
  text: string;
  isCode?: boolean;
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
      <span className="text-text-tertiary typo-footnote">{label}</span>
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
      <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
      {children}
    </div>
  </section>
);

const AgentSetupModal = ({
  onClose,
}: {
  onClose: () => void;
}): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FlexibleCenter}
    size={Modal.Size.Medium}
    isDrawerOnMobile
    onRequestClose={onClose}
  >
    <Modal.Header title="Connect your AI agent" />
    <Modal.Body className="flex flex-col gap-6">
      <p className="text-text-secondary typo-callout">
        Add the daily.dev MCP server to Claude, Cursor, Codex or any MCP client.
        Your agent can then read and change all of your feed settings.
      </p>
      <Step number={1} title="Add the MCP server">
        <CopyBlock label="In Claude Code" text={claudeCodeCommand} isCode />
        <CopyBlock
          label="In any other MCP client, add this server and sign in when asked"
          text={mcpServerUrl}
          isCode
        />
      </Step>
      <Step number={2} title="Ask for what you want">
        <CopyBlock
          label="Start with this, or ask for something specific"
          text={starterPrompt}
        />
      </Step>
      <p className="text-text-tertiary typo-footnote">
        Every change it makes shows up in these settings, and you can undo any
        of it.{' '}
        <a
          href={mcpServerDocs}
          target="_blank"
          rel={anchorDefaultRel}
          className="text-text-link hover:underline"
        >
          Setup guide
        </a>
      </p>
    </Modal.Body>
  </Modal>
);

export const AgentSetupButton = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<TerminalIcon />}
        onClick={() => setIsOpen(true)}
      >
        Connect your agent
      </Button>
      {isOpen && <AgentSetupModal onClose={() => setIsOpen(false)} />}
    </>
  );
};
