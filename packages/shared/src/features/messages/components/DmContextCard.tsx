import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import CloseButton from '../../../components/CloseButton';
import { ButtonSize } from '../../../components/buttons/Button';
import type { DmCommentContext } from '../types';

export const DmContextCard = ({
  context,
  label,
  onDismiss,
  className,
}: {
  context: DmCommentContext;
  label: string;
  onDismiss?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-start gap-2 rounded-12 border-l-2 border-border-subtlest-secondary bg-surface-float px-3 py-2',
      className,
    )}
  >
    <Link href={context.permalink} passHref>
      <a className="min-w-0 flex-1" target="_blank" rel="noopener">
        <FlexCol className="gap-0.5">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            truncate
          >
            {label}
            {context.postTitle && ` on “${context.postTitle}”`}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="line-clamp-2"
          >
            {context.snippet}
          </Typography>
        </FlexCol>
      </a>
    </Link>
    {onDismiss && (
      <CloseButton
        size={ButtonSize.XSmall}
        onClick={onDismiss}
        aria-label="Remove comment reference"
      />
    )}
  </div>
);
