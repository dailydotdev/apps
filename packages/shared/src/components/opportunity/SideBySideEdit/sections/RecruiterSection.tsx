import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { EditIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import type { Opportunity } from '../../../../features/opportunity/types';
import Link from '../../../utilities/Link';

export interface RecruiterSectionProps {
  opportunity: Opportunity;
}

export function RecruiterSection({
  opportunity,
}: RecruiterSectionProps): ReactElement {
  const recruiter = opportunity?.recruiters?.[0];
  const hasRecruiter = !!recruiter?.name;

  if (!hasRecruiter) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        No recruiter info added yet
      </Typography>
    );
  }

  const profileEditUrl = '/settings/profile';

  return (
    <Link href={profileEditUrl}>
      <a className="group -mx-2 flex items-center gap-3 rounded-10 p-2 transition-colors hover:bg-surface-hover">
        {recruiter?.image ? (
          <img
            src={recruiter.image}
            alt={recruiter.name}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-float">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
            >
              {recruiter.name?.charAt(0)?.toUpperCase()}
            </Typography>
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            className="truncate"
          >
            {recruiter.name}
          </Typography>
          {recruiter.title && (
            <>
              <span className="text-text-tertiary">·</span>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                {recruiter.title}
              </Typography>
            </>
          )}
        </div>

        <EditIcon
          size={IconSize.Small}
          className="shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary"
        />
      </a>
    </Link>
  );
}

export default RecruiterSection;
