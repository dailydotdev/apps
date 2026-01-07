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
import { LinkedProfileSection } from './sections/LinkedProfileSection';

export interface OpportunityEditPanelProps {
  opportunity: Opportunity;
  onSectionFocus?: (sectionId: string) => void;
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
    if (willExpand && onFocus) {
      onFocus();
    }
  };

  return (
    <div className="border-t border-border-subtlest-tertiary">
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
          className="border-t border-border-subtlest-tertiary"
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Content section configuration for config-driven rendering
type ContentSectionConfig = {
  id:
    | 'overview'
    | 'responsibilities'
    | 'requirements'
    | 'whatYoullDo'
    | 'interviewProcess';
  title: string;
  required: boolean;
  getDefaultExpanded?: (opportunity: Opportunity) => boolean;
};

const contentSections: ContentSectionConfig[] = [
  { id: 'overview', title: 'Overview', required: true },
  { id: 'responsibilities', title: 'Responsibilities', required: true },
  { id: 'requirements', title: 'Requirements', required: true },
  {
    id: 'whatYoullDo',
    title: "What You'll Do",
    required: false,
    getDefaultExpanded: (opp) => !!opp?.content?.whatYoullDo?.html,
  },
  {
    id: 'interviewProcess',
    title: 'Interview Process',
    required: false,
    getDefaultExpanded: (opp) => !!opp?.content?.interviewProcess?.html,
  },
];

export function OpportunityEditPanel({
  opportunity,
  onSectionFocus,
  className,
}: OpportunityEditPanelProps): ReactElement {
  const company = opportunity?.organization;
  const recruiter = opportunity?.recruiters?.[0];

  return (
    <div
      className={classNames(
        'flex min-w-0 flex-col overflow-x-hidden border-r border-border-subtlest-tertiary',
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

      <div className="flex flex-col pb-6">
        {/* Role Info section with form inputs */}
        <CollapsibleSection
          id="roleInfo"
          title="Role Info"
          required
          onFocus={() => onSectionFocus?.('roleInfo')}
        >
          <div className="flex flex-col gap-4 p-4">
            <RoleInfoSection opportunity={opportunity} />
            <JobDetailsSection />
          </div>
        </CollapsibleSection>

        {/* Content sections - config-driven */}
        {contentSections.map((section) => (
          <CollapsibleSection
            key={section.id}
            id={section.id}
            title={section.title}
            required={section.required}
            defaultExpanded={section.getDefaultExpanded?.(opportunity) ?? true}
            onFocus={() => onSectionFocus?.(section.id)}
          >
            <ContentSection
              section={section.id}
              onFocus={() => onSectionFocus?.(section.id)}
            />
          </CollapsibleSection>
        ))}

        {/* Linked profiles - flat list without collapsible wrapper */}
        <div className="mt-4 flex flex-col gap-3 px-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Linked profiles
          </Typography>
          <LinkedProfileSection
            type="company"
            name={company?.name}
            image={company?.image}
            editUrl={`/recruiter/organizations/${company?.id}`}
            emptyMessage="No company info added yet"
          />
          <LinkedProfileSection
            type="recruiter"
            name={recruiter?.name}
            image={recruiter?.image}
            subtitle={recruiter?.title}
            editUrl="/settings/profile"
            emptyMessage="No recruiter info added yet"
          />
        </div>
      </div>
    </div>
  );
}

export default OpportunityEditPanel;
