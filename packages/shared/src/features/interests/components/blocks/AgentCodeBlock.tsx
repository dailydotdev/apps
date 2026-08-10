import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { FlexRow } from '../../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { CopyIcon, PlayIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useCopyLink } from '../../../../hooks/useCopy';

export const AgentCodeBlock = ({
  code,
  label,
  runLabel,
  onRun,
}: {
  code: string;
  label?: string;
  runLabel?: string;
  onRun?: () => void;
}): ReactElement => {
  const [, copy] = useCopyLink(() => code);

  return (
    <div className="w-full overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-surface-float">
      <FlexRow className="items-center gap-2 border-b border-border-subtlest-quaternary py-1 pl-3 pr-1">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          className="min-w-0 flex-1 truncate font-mono"
        >
          {label}
        </Typography>
        {onRun && (
          <Tooltip content={runLabel ?? 'Run'}>
            <Button
              icon={<PlayIcon size={IconSize.Size16} />}
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              aria-label={runLabel ?? 'Run'}
              onClick={onRun}
            />
          </Tooltip>
        )}
        <Tooltip content="Copy">
          <Button
            icon={<CopyIcon size={IconSize.Size16} />}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            aria-label="Copy"
            // The hook already reports its own failure; without the catch the
            // same failure also escapes the press as an unhandled rejection.
            onClick={() =>
              Promise.resolve(
                copy({ link: code, message: '✅ Copied to clipboard' }),
              ).catch(() => undefined)
            }
          />
        </Tooltip>
      </FlexRow>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-text-secondary typo-caption1">
          {code}
        </code>
      </pre>
    </div>
  );
};
