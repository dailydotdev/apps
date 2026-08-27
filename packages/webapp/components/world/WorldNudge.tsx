import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

interface WorldNudgeProps {
  onCustomize: () => void;
  className?: string;
}

/** Disappears on the first customisation, not on a dismissal — there is nothing to dismiss once the world has been made someone's own. */
export function WorldNudge({
  onCustomize,
  className,
}: WorldNudgeProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-start gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3',
        className,
      )}
    >
      <Typography type={TypographyType.Footnote} bold>
        This world is still unnamed
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        Your reading built the place. How it looks is yours.
      </Typography>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={<SettingsIcon />}
        onClick={onCustomize}
      >
        Make it yours
      </Button>
    </div>
  );
}
