import type { ReactElement } from 'react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import type { OpportunitySideBySideEditFormData } from './hooks/useOpportunityEditForm';
import type { Opportunity } from '../../../features/opportunity/types';

export interface OpportunityEditPanelProps {
  /**
   * Form instance for managing form state
   */
  form: UseFormReturn<OpportunitySideBySideEditFormData>;
  /**
   * The opportunity being edited
   */
  opportunity: Opportunity;
  /**
   * Callback when company edit button is clicked
   */
  onEditCompany?: () => void;
  /**
   * Callback when recruiter edit button is clicked
   */
  onEditRecruiter?: () => void;
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Edit panel for the side-by-side opportunity editor.
 *
 * Contains all editable sections:
 * - Role Info (title, TLDR, keywords, location)
 * - Job Details (employment, seniority, team size, salary)
 * - Content sections (overview, responsibilities, requirements, etc.)
 * - Company (opens modal)
 * - Recruiter (opens modal)
 *
 * TODO: Implement actual section components in Phase 2
 */
export function OpportunityEditPanel({
  form,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  opportunity: _opportunity,
  onEditCompany,
  onEditRecruiter,
  className,
}: OpportunityEditPanelProps): ReactElement {
  // Placeholder sections for layout review
  const sections = [
    { id: 'roleInfo', title: 'Role Info', required: true },
    { id: 'jobDetails', title: 'Job Details', required: true },
    { id: 'overview', title: 'Overview', required: true },
    { id: 'responsibilities', title: 'Responsibilities', required: true },
    { id: 'requirements', title: 'Requirements', required: true },
    { id: 'whatYoullDo', title: "What You'll Do", required: false },
    { id: 'interviewProcess', title: 'Interview Process', required: false },
    { id: 'company', title: 'Company', required: false, isModal: true },
    { id: 'recruiter', title: 'Recruiter', required: false, isModal: true },
  ];

  return (
    <div className={classNames('flex flex-col', className)}>
      <div className="p-4">
        <Typography type={TypographyType.Title3} bold className="mb-2">
          Edit Job Posting
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Changes are auto-saved locally. Click Save to publish.
        </Typography>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography type={TypographyType.Callout} bold>
                  {section.title}
                </Typography>
                {section.required && (
                  <span className="text-xs text-status-error">*</span>
                )}
              </div>
              {section.isModal && (
                <button
                  type="button"
                  className="text-sm text-text-link hover:underline"
                  onClick={
                    section.id === 'company' ? onEditCompany : onEditRecruiter
                  }
                >
                  Edit details →
                </button>
              )}
            </div>

            {/* Placeholder content - will be replaced with actual form fields */}
            <div className="mt-3 rounded-8 border border-dashed border-border-subtlest-secondary bg-background-subtle p-3">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                {section.isModal
                  ? `${section.title} section - click "Edit details" to modify`
                  : `${section.title} form fields will be implemented in Phase 2`}
              </Typography>
            </div>
          </div>
        ))}
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-border-subtlest-tertiary p-4">
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
          >
            Form dirty: {form.formState.isDirty ? 'Yes' : 'No'}
          </Typography>
        </div>
      )}
    </div>
  );
}

export default OpportunityEditPanel;
