import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MoveToIcon } from '../../../components/icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ShellPage } from '../../../components/shell/ShellPageContext';

interface SquadSubPageHeaderProps {
  title: string;
  backUrl: string;
  backLabel: string;
  action?: ReactNode;
  className?: string;
}

// Back, the page's title and its one action, the way a profile sub-page
// (Add experience) is laid out.
export const SquadSubPageHeader = ({
  title,
  backUrl,
  backLabel,
  action,
  className,
}: SquadSubPageHeaderProps): ReactElement => (
  <>
    <ShellPage title={title} actions={action} />
    <div
      className={classNames(
        'hidden h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-4 tablet:flex tablet:px-6',
        className,
      )}
    >
      <Link href={backUrl} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MoveToIcon className="rotate-180" />}
          aria-label={backLabel}
        />
      </Link>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Body}
        bold
        truncate
        className="min-w-0 flex-1 tablet:typo-title3"
      >
        {title}
      </Typography>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </>
);
