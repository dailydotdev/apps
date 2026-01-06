import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import type { Opportunity } from '../../../features/opportunity/types';
import { RoleInfoSection } from './sections/RoleInfoSection';
import { JobDetailsSection } from './sections/JobDetailsSection';
import { ContentSection } from './sections/ContentSection';
import { CompanySection } from './sections/CompanySection';
import { RecruiterSection } from './sections/RecruiterSection';

export interface OpportunityEditPanelProps {
  /**
   * The opportunity being edited
   */
  opportunity: Opportunity;
  /**
   * Callback when a section is focused/expanded (for scroll sync)
   */
  onSectionFocus?: (sectionId: string) => void;
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
  onFocus?: () => void;
}

function CollapsibleSection({
  id,
  title,
  required = false,
  children,
  defaultExpanded = true,
  onFocus,
}: CollapsibleSectionProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleClick = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    // Trigger scroll sync when expanding
    if (willExpand && onFocus) {
      onFocus();
    }
  };

  return (
    <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float">
      <button
        type="button"
        className="flex w-full items-center justify-between p-4"
        onClick={handleClick}
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
 * - Company (inline editing)
 * - Recruiter (inline editing)
 */
export function OpportunityEditPanel({
  opportunity,
  onSectionFocus,
  className,
}: OpportunityEditPanelProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex min-w-0 flex-col overflow-x-hidden',
        className,
      )}
    >
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
        {/* Role Info Section (includes job details) */}
        <CollapsibleSection
          id="roleInfo"
          title="Role Info"
          required
          onFocus={() => onSectionFocus?.('roleInfo')}
        >
          <RoleInfoSection opportunity={opportunity} />
          <JobDetailsSection />
        </CollapsibleSection>

        {/* Overview Section */}
        <CollapsibleSection
          id="overview"
          title="Overview"
          required
          onFocus={() => onSectionFocus?.('overview')}
        >
          <ContentSection section="overview" />
        </CollapsibleSection>

        {/* Responsibilities Section */}
        <CollapsibleSection
          id="responsibilities"
          title="Responsibilities"
          required
          onFocus={() => onSectionFocus?.('responsibilities')}
        >
          <ContentSection section="responsibilities" />
        </CollapsibleSection>

        {/* Requirements Section */}
        <CollapsibleSection
          id="requirements"
          title="Requirements"
          required
          onFocus={() => onSectionFocus?.('requirements')}
        >
          <ContentSection section="requirements" />
        </CollapsibleSection>

        {/* What You'll Do Section (optional) */}
        <CollapsibleSection
          id="whatYoullDo"
          title="What You'll Do"
          defaultExpanded={!!opportunity?.content?.whatYoullDo?.html}
          onFocus={() => onSectionFocus?.('whatYoullDo')}
        >
          <ContentSection section="whatYoullDo" />
        </CollapsibleSection>

        {/* Interview Process Section (optional) */}
        <CollapsibleSection
          id="interviewProcess"
          title="Interview Process"
          defaultExpanded={!!opportunity?.content?.interviewProcess?.html}
          onFocus={() => onSectionFocus?.('interviewProcess')}
        >
          <ContentSection section="interviewProcess" />
        </CollapsibleSection>

        {/* Company Section */}
        <CollapsibleSection
          id="company"
          title="Company"
          onFocus={() => onSectionFocus?.('company')}
        >
          <CompanySection opportunity={opportunity} />
        </CollapsibleSection>

        {/* Recruiter Section */}
        <CollapsibleSection
          id="recruiter"
          title="Recruiter"
          onFocus={() => onSectionFocus?.('recruiter')}
        >
          <RecruiterSection opportunity={opportunity} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

export default OpportunityEditPanel;
