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

export interface CompanySectionProps {
  opportunity: Opportunity;
}

export function CompanySection({
  opportunity,
}: CompanySectionProps): ReactElement {
  const company = opportunity?.organization;
  const hasCompany = !!company?.name;

  if (!hasCompany) {
    return (
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
      >
        No company info added yet
      </Typography>
    );
  }

  const companyEditUrl = `/recruiter/organizations/${company.id}`;

  return (
    <Link href={companyEditUrl}>
      <a className="group -mx-2 flex items-center gap-3 rounded-10 p-2 transition-colors hover:bg-surface-hover">
        {company?.image ? (
          <img
            src={company.image}
            alt={company.name}
            className="h-8 w-8 shrink-0 rounded-8 object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-8 bg-surface-float">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
            >
              {company.name?.charAt(0)?.toUpperCase()}
            </Typography>
          </div>
        )}

        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="min-w-0 flex-1 truncate"
        >
          {company.name}
        </Typography>

        <EditIcon
          size={IconSize.Small}
          className="shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary"
        />
      </a>
    </Link>
  );
}

export default CompanySection;
