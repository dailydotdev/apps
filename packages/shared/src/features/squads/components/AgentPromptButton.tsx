import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useCopyLink } from '../../../hooks/useCopy';
import { agentMarks } from './checkout/agentMarks';
import { AgentMark } from './checkout/AgentMark';

const shownAgents = [
  agentMarks['claude-code'],
  agentMarks.codex,
  agentMarks.cursor,
];

interface AgentPromptButtonProps {
  /** Built on click, so it carries the latest state */
  getPrompt: () => string;
  label: string;
  hint: string;
  copiedHint: string;
  onCopy?: () => void;
  className?: string;
}

/** Copies a prompt; the founder pastes it into their agent. */
export const AgentPromptButton = ({
  getPrompt,
  label,
  hint,
  copiedHint,
  onCopy,
  className,
}: AgentPromptButtonProps): ReactElement => {
  const [isCopying, copy] = useCopyLink(getPrompt);

  return (
    <div className={classNames('flex flex-col items-center gap-2', className)}>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        className="w-full"
        onClick={() => {
          copy();
          onCopy?.();
        }}
      >
        <span className="mr-2 flex -space-x-1.5" aria-hidden>
          {shownAgents.map((mark) => (
            <AgentMark
              key={mark.name}
              mark={mark}
              className="size-6 rounded-8 ring-2 ring-background-default"
              glyphClassName="size-4"
            />
          ))}
        </span>
        {isCopying ? 'Prompt copied' : label}
      </Button>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="text-center"
      >
        {isCopying ? copiedHint : hint}
      </Typography>
    </div>
  );
};
