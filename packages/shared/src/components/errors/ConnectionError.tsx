import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ButtonV2, ButtonVariant } from '../buttons/ButtonV2';
import { RefreshIcon, TerminalIcon } from '../icons';
import { statusPage } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

function ConnectionError({ onRetry }: { onRetry?: () => void }): ReactElement {
  return (
    <div className="flex max-h-full w-full flex-col items-center justify-center gap-4 self-center text-center laptop:w-[21.25rem] laptop:max-w-[21.25rem]">
      <Typography type={TypographyType.LargeTitle} bold>
        Connection lost
      </Typography>
      <Typography
        type={TypographyType.Body}
        bold
        color={TypographyColor.Tertiary}
      >
        Looks like your internet connection is playing hide and seek. Check your
        connection and try again.
      </Typography>
      {onRetry && (
        <ButtonV2
          variant={ButtonVariant.Subtle}
          className="w-full"
          icon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try again
        </ButtonV2>
      )}
      <ButtonV2
        variant={ButtonVariant.Subtle}
        className="w-full"
        icon={<TerminalIcon />}
        href={statusPage}
        target="_blank"
        rel={anchorDefaultRel}
        tag="a"
      >
        Check system status
      </ButtonV2>
    </div>
  );
}
export default ConnectionError;
