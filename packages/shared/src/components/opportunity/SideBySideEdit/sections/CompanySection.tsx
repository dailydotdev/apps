import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { EditIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import type { Opportunity } from '../../../../features/opportunity/types';

export interface CompanySectionProps {
  /**
   * The opportunity being edited
   */
  opportunity: Opportunity;
  /**
   * Callback when edit button is clicked
   */
  onEdit?: () => void;
}

/**
 * Company section for the side-by-side edit panel.
 * Shows company summary and opens modal for detailed editing.
 */
export function CompanySection({
  opportunity,
  onEdit,
}: CompanySectionProps): ReactElement {
  const company = opportunity?.organization;
  const hasCompany = !!company?.name;

  return (
    <div className="flex flex-col gap-3">
      {hasCompany ? (
        <div className="flex items-start gap-3">
          {company?.image && (
            <img
              src={company.image}
              alt={company.name}
              className="h-10 w-10 rounded-8 object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Callout} bold>
              {company.name}
            </Typography>
            {company.description && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="line-clamp-2"
              >
                {company.description}
              </Typography>
            )}
          </div>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<EditIcon size={IconSize.Small} />}
            onClick={onEdit}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            No company info added yet
          </Typography>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onEdit}
          >
            Add company
          </Button>
        </div>
      )}
    </div>
  );
}

export default CompanySection;
