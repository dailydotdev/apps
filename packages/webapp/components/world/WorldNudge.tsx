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

/**
 * Shown once, on your own world, until you have made something of it.
 *
 * The gear is in the header the whole time, and a gear is a thing you find
 * rather than a thing you are offered — which is fine for a setting and wrong
 * for the half of this feature that is the point. So a world nobody has named,
 * dressed or graded says so, and stops saying it the moment they have.
 *
 * It goes away on the first customisation rather than on a dismissal: there is
 * nothing to dismiss once the answer is yes.
 */
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
      {/* Three lines that say three different things: what is missing, whose
          the place is, and what to do about it. The first draft had all three
          saying "name this world". */}
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
