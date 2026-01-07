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
          className="border-t border-border-subtlest-tertiary"
        >
          {children}
        </div>
      )}
    </div>
  );
}

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

      <div className="flex flex-col gap-2 pb-6">
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

        <CollapsibleSection
          id="overview"
          title="Overview"
          required
          onFocus={() => onSectionFocus?.('overview')}
        >
          <ContentSection
            section="overview"
            onFocus={() => onSectionFocus?.('overview')}
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="responsibilities"
          title="Responsibilities"
          required
          onFocus={() => onSectionFocus?.('responsibilities')}
        >
          <ContentSection
            section="responsibilities"
            onFocus={() => onSectionFocus?.('responsibilities')}
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="requirements"
          title="Requirements"
          required
          onFocus={() => onSectionFocus?.('requirements')}
        >
          <ContentSection
            section="requirements"
            onFocus={() => onSectionFocus?.('requirements')}
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="whatYoullDo"
          title="What You'll Do"
          defaultExpanded={!!opportunity?.content?.whatYoullDo?.html}
          onFocus={() => onSectionFocus?.('whatYoullDo')}
        >
          <ContentSection
            section="whatYoullDo"
            onFocus={() => onSectionFocus?.('whatYoullDo')}
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="interviewProcess"
          title="Interview Process"
          defaultExpanded={!!opportunity?.content?.interviewProcess?.html}
          onFocus={() => onSectionFocus?.('interviewProcess')}
        >
          <ContentSection
            section="interviewProcess"
            onFocus={() => onSectionFocus?.('interviewProcess')}
          />
        </CollapsibleSection>

        {/* Linked profiles - flat list without collapsible wrapper */}
        <div className="mt-4 flex flex-col gap-3 px-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            bold
          >
            Linked profiles
          </Typography>
          <CompanySection opportunity={opportunity} />
          <RecruiterSection opportunity={opportunity} />
        </div>
      </div>
    </div>
  );
}

export default OpportunityEditPanel;
