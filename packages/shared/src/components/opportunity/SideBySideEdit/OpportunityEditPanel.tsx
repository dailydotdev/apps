import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import type { OpportunitySideBySideEditFormData } from './hooks/useOpportunityEditForm';
import type { Opportunity } from '../../../features/opportunity/types';
import { RoleInfoSection } from './sections/RoleInfoSection';
import { JobDetailsSection } from './sections/JobDetailsSection';
import { ContentSection } from './sections/ContentSection';
import { CompanySection } from './sections/CompanySection';
import { RecruiterSection } from './sections/RecruiterSection';

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

interface CollapsibleSectionProps {
  id: string;
  title: string;
  required?: boolean;
  children: ReactNode;
  defaultExpanded?: boolean;
}

function CollapsibleSection({
  id,
  title,
  required = false,
  children,
  defaultExpanded = true,
}: CollapsibleSectionProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float">
      <button
        type="button"
        className="flex w-full items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-2">
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
          {required && <span className="text-xs text-status-error">*</span>}
        </div>
        <ArrowIcon
          size={IconSize.Small}
          className={classNames(
            'text-text-tertiary transition-transform',
            isExpanded ? 'rotate-0' : 'rotate-180',
          )}
        />
      </button>
      {isExpanded && (
        <div
          id={`section-${id}`}
          className="border-t border-border-subtlest-tertiary p-4"
        >
          {children}
        </div>
      )}
    </div>
  );
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
 */
export function OpportunityEditPanel({
  form,
  opportunity,
  onEditCompany,
  onEditRecruiter,
  className,
}: OpportunityEditPanelProps): ReactElement {
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
        {/* Role Info Section */}
        <CollapsibleSection id="roleInfo" title="Role Info" required>
          <RoleInfoSection opportunity={opportunity} />
        </CollapsibleSection>

        {/* Job Details Section */}
        <CollapsibleSection id="jobDetails" title="Job Details" required>
          <JobDetailsSection />
        </CollapsibleSection>

        {/* Overview Section */}
        <CollapsibleSection id="overview" title="Overview" required>
          <ContentSection section="overview" />
        </CollapsibleSection>

        {/* Responsibilities Section */}
        <CollapsibleSection
          id="responsibilities"
          title="Responsibilities"
          required
        >
          <ContentSection section="responsibilities" />
        </CollapsibleSection>

        {/* Requirements Section */}
        <CollapsibleSection id="requirements" title="Requirements" required>
          <ContentSection section="requirements" />
        </CollapsibleSection>

        {/* What You'll Do Section (optional) */}
        <CollapsibleSection
          id="whatYoullDo"
          title="What You'll Do"
          defaultExpanded={!!opportunity?.content?.whatYoullDo?.html}
        >
          <ContentSection section="whatYoullDo" />
        </CollapsibleSection>

        {/* Interview Process Section (optional) */}
        <CollapsibleSection
          id="interviewProcess"
          title="Interview Process"
          defaultExpanded={!!opportunity?.content?.interviewProcess?.html}
        >
          <ContentSection section="interviewProcess" />
        </CollapsibleSection>

        {/* Company Section */}
        <CollapsibleSection id="company" title="Company">
          <CompanySection opportunity={opportunity} onEdit={onEditCompany} />
        </CollapsibleSection>

        {/* Recruiter Section */}
        <CollapsibleSection id="recruiter" title="Recruiter">
          <RecruiterSection
            opportunity={opportunity}
            onEdit={onEditRecruiter}
          />
        </CollapsibleSection>
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
