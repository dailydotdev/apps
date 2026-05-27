import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Link from '../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { MagicIcon, HomeIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';

interface BriefSwitcherProps {
  className?: string;
}

const TAB_BRIEF = '/your-brief';
const TAB_FEED = '/';

export const BriefSwitcher = ({
  className,
}: BriefSwitcherProps): ReactElement => {
  const router = useRouter();
  const path = router?.pathname ?? '';
  const isBrief = path === TAB_BRIEF;

  return (
    <nav
      aria-label="Brief / feed switch"
      className={classNames(
        'inline-flex w-fit shrink-0 items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-default p-1',
        className,
      )}
    >
      <Link href={TAB_BRIEF} passHref>
        <a
          aria-current={isBrief ? 'page' : undefined}
          className={classNames(
            'inline-flex items-center gap-2 rounded-10 px-3 py-1.5 transition-colors',
            isBrief
              ? 'bg-surface-float text-text-primary'
              : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
          )}
        >
          <MagicIcon
            size={IconSize.XSmall}
            className={
              isBrief ? 'text-accent-cabbage-default' : 'text-text-tertiary'
            }
            secondary={isBrief}
          />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            bold
            color={isBrief ? TypographyColor.Primary : TypographyColor.Tertiary}
          >
            Your brief
          </Typography>
        </a>
      </Link>
      <Link href={TAB_FEED} passHref>
        <a
          aria-current={!isBrief ? 'page' : undefined}
          className={classNames(
            'inline-flex items-center gap-2 rounded-10 px-3 py-1.5 transition-colors',
            !isBrief
              ? 'bg-surface-float text-text-primary'
              : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
          )}
        >
          <HomeIcon size={IconSize.XSmall} secondary={!isBrief} />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            bold
            color={
              !isBrief ? TypographyColor.Primary : TypographyColor.Tertiary
            }
          >
            Your feed
          </Typography>
        </a>
      </Link>
    </nav>
  );
};
