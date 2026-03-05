import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Typography, TypographyColor, TypographyType } from '../typography/Typography';
import {
  plusSupportedAgentClaudeCodeLogo,
  plusSupportedAgentCodexLogo,
  plusSupportedAgentCursorLogo,
  plusSupportedAgentGithubCopilotLogo,
  plusSupportedAgentOpenClawLogo,
} from '../../lib/image';

type PlusSupportedAgentsProps = {
  center?: boolean;
};

type SupportedAgent = {
  name: string;
  shortName: string;
  logoUrl?: string;
};

const supportedAgents: SupportedAgent[] = [
  {
    name: 'OpenClaw',
    shortName: 'OC',
    logoUrl: plusSupportedAgentOpenClawLogo,
  },
  {
    name: 'Claude Code',
    shortName: 'CC',
    logoUrl: plusSupportedAgentClaudeCodeLogo,
  },
  {
    name: 'Codex',
    shortName: 'CX',
    logoUrl: plusSupportedAgentCodexLogo,
  },
  {
    name: 'Cursor',
    shortName: 'CU',
    logoUrl: plusSupportedAgentCursorLogo,
  },
  {
    name: 'GitHub Copilot',
    shortName: 'GC',
    logoUrl: plusSupportedAgentGithubCopilotLogo,
  },
];

const AgentLogo = ({
  name,
  shortName,
  logoUrl,
}: SupportedAgent): ReactElement => {
  const [showFallback, setShowFallback] = useState(!logoUrl);

  return (
    <div className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-2.5 py-1.5">
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-4 bg-background-subtle">
        {showFallback ? (
          <span className="text-[0.625rem] font-bold leading-none text-text-secondary">
            {shortName}
          </span>
        ) : (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-full w-full object-contain grayscale"
            loading="lazy"
            onError={() => setShowFallback(true)}
          />
        )}
      </span>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="whitespace-nowrap"
      >
        {name}
      </Typography>
    </div>
  );
};

export const PlusSupportedAgents = ({
  center,
}: PlusSupportedAgentsProps): ReactElement => {
  return (
    <div className={classNames('flex flex-col gap-2', center && 'items-center')}>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="uppercase tracking-[0.08em]"
      >
        Works with
      </Typography>
      <div
        className={classNames(
          'flex flex-wrap gap-2',
          center && 'justify-center',
        )}
      >
        {supportedAgents.map((agent) => (
          <AgentLogo key={agent.name} {...agent} />
        ))}
      </div>
    </div>
  );
};
