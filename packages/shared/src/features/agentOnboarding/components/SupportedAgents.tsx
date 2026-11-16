import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { AgentMark } from '../../squads/components/checkout/AgentMark';
import { agentMarks } from '../../squads/components/checkout/agentMarks';

const agents = [
  { label: 'Claude Code', mark: agentMarks['claude-code'] },
  { label: 'Codex', mark: agentMarks.codex },
  { label: 'Cursor', mark: agentMarks.cursor },
];

export const SupportedAgents = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <ul className={classNames('flex flex-wrap items-center gap-4', className)}>
    {agents.map(({ label, mark }) => (
      <li key={label} className="flex items-center gap-2">
        <AgentMark
          mark={mark}
          className="size-6 rounded-6"
          glyphClassName="size-4"
        />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {label}
        </Typography>
      </li>
    ))}
  </ul>
);
