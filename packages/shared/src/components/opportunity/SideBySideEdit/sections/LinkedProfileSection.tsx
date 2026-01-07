import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { EditIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import Link from '../../../utilities/Link';

export interface LinkedProfileSectionProps {
  type: 'company' | 'recruiter';
  name?: string;
  image?: string;
  subtitle?: string;
  editUrl: string;
  emptyMessage: string;
}

export function LinkedProfileSection({
  type,
  name,
  image,
  subtitle,
  editUrl,
  emptyMessage,
}: LinkedProfileSectionProps): ReactElement {
  const hasData = !!name;

  if (!hasData) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        {emptyMessage}
      </Typography>
    );
  }

  const avatarBorderRadius = type === 'company' ? 'rounded-8' : 'rounded-full';

  const renderSubtitle = (): ReactNode => {
    if (!subtitle) {
      return null;
    }

    return (
      <>
        <span className="text-text-tertiary">·</span>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="truncate"
        >
          {subtitle}
        </Typography>
      </>
    );
  };

  return (
    <Link href={editUrl}>
      <a className="group -mx-2 flex items-center gap-3 rounded-10 p-2 transition-colors hover:bg-surface-hover">
        {image ? (
          <img
            src={image}
            alt={name}
            className={classNames(
              'h-8 w-8 shrink-0 object-cover',
              avatarBorderRadius,
            )}
          />
        ) : (
          <div
            className={classNames(
              'flex h-8 w-8 shrink-0 items-center justify-center bg-surface-float',
              avatarBorderRadius,
            )}
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
            >
              {name?.charAt(0)?.toUpperCase()}
            </Typography>
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            className="truncate"
          >
            {name}
          </Typography>
          {renderSubtitle()}
        </div>

        <EditIcon
          size={IconSize.Small}
          className="shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary"
        />
      </a>
    </Link>
  );
}

export default LinkedProfileSection;
