import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons/MoveTo';

// The squads frame (SquadDiscoverFrame, SquadPageLayout): full-bleed on
// phones, a bordered card with a w-80 widget column from laptop. Below
// laptop the widgets follow the main column.
export const Frame = ({
  children,
  side,
}: {
  children: ReactNode;
  side?: ReactNode;
}): ReactElement => (
  <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
    <div className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:self-start laptop:rounded-16 laptop:border">
      {children}
    </div>
    {side && (
      <aside className="flex w-full flex-col gap-4 px-4 pb-6 tablet:px-6 laptop:sticky laptop:top-4 laptop:w-80 laptop:shrink-0 laptop:self-start laptop:px-0 laptop:pb-0">
        {side}
      </aside>
    )}
  </div>
);

// SquadSubPageHeader: back, the title and one action. Phones put the same
// title and action in the shell block instead.
export const SubPageHeader = ({
  title,
  onBack,
  action,
}: {
  title: ReactNode;
  onBack?: () => void;
  action?: ReactNode;
}): ReactElement => (
  <header className="hidden h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-4 laptop:flex tablet:px-6">
    {onBack && (
      <Button
        type="button"
        aria-label="Back"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<MoveToIcon className="rotate-180" />}
        onClick={onBack}
      />
    )}
    <Typography
      tag={TypographyTag.H1}
      type={TypographyType.Body}
      bold
      truncate
      className="min-w-0 flex-1 tablet:typo-title3"
    >
      {title}
    </Typography>
    {action}
  </header>
);

// The page header strip of the squads directory: no page title, because
// the selected tab already names the page.
export const pageHeaderClassName =
  'hidden min-h-14 w-full shrink-0 items-center gap-4 border-b border-border-subtlest-quaternary px-6 laptop:flex';

export const panelClassName = (className?: string): string =>
  classNames('flex flex-col gap-6 px-4 py-5 tablet:px-6', className);
