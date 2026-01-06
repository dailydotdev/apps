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

export interface RecruiterSectionProps {
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
 * Recruiter section for the side-by-side edit panel.
 * Shows recruiter summary and opens modal for detailed editing.
 */
export function RecruiterSection({
  opportunity,
  onEdit,
}: RecruiterSectionProps): ReactElement {
  // Get the first recruiter from the recruiters array
  const recruiter = opportunity?.recruiters?.[0];
  const hasRecruiter = !!recruiter?.name;

  return (
    <div className="flex flex-col gap-3">
      {hasRecruiter ? (
        <div className="flex items-start gap-3">
          {recruiter?.image && (
            <img
              src={recruiter.image}
              alt={recruiter.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <Typography type={TypographyType.Callout} bold>
              {recruiter.name}
            </Typography>
            {recruiter.title && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {recruiter.title}
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
            No recruiter info added yet
          </Typography>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onEdit}
          >
            Add recruiter
          </Button>
        </div>
      )}
    </div>
  );
}

export default RecruiterSection;
