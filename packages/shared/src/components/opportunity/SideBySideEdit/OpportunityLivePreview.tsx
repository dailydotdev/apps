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

export interface OpportunityLivePreviewProps {
  /**
   * Form instance for watching real-time changes
   */
  form: UseFormReturn<OpportunitySideBySideEditFormData>;
  /**
   * The opportunity being previewed
   */
  opportunity: Opportunity;
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Live preview panel for the side-by-side opportunity editor.
 *
 * Shows a real-time preview of how the job posting will look to candidates.
 * Uses form.watch() to display changes as they happen.
 *
 * TODO: In Phase 3, this will wrap the actual JobPage component
 * with previewMode and previewData props.
 */
export function OpportunityLivePreview({
  form,
  opportunity,
  className,
}: OpportunityLivePreviewProps): ReactElement {
  const watchedValues = form.watch();

  return (
    <div className={classNames('p-6', className)}>
      {/* Preview header */}
      <div className="mb-6 rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="mb-2"
        >
          LIVE PREVIEW
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          This is how candidates will see your job posting. Changes appear in
          real-time as you edit.
        </Typography>
      </div>

      {/* Placeholder job preview card */}
      <div className="shadow-sm rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
        {/* Company logo placeholder */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-surface-float" />
          <div>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {opportunity.organization?.name || 'Company Name'}
            </Typography>
          </div>
        </div>

        {/* Job title - from form */}
        <Typography type={TypographyType.LargeTitle} bold className="mb-2">
          {watchedValues.title || 'Job Title'}
        </Typography>

        {/* Keywords placeholder */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(watchedValues.keywords?.length > 0
            ? watchedValues.keywords
            : [{ keyword: 'React' }, { keyword: 'TypeScript' }]
          )
            .slice(0, 5)
            .map((k) => (
              <span
                key={k.keyword}
                className="rounded-8 bg-surface-float px-2 py-1 text-xs text-text-secondary"
              >
                {k.keyword}
              </span>
            ))}
        </div>

        {/* TLDR - from form */}
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="mb-6"
        >
          {watchedValues.tldr ||
            'Add a short description to attract candidates...'}
        </Typography>

        {/* Meta info placeholder */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-text-tertiary">
          <span>📍 Location</span>
          <span>💰 Salary Range</span>
          <span>🕐 Full-time</span>
        </div>

        {/* Content sections placeholder */}
        <div className="space-y-6">
          {['Overview', 'Responsibilities', 'Requirements'].map((section) => (
            <div
              key={section}
              className="border-t border-border-subtlest-tertiary pt-4"
            >
              <Typography type={TypographyType.Body} bold className="mb-2">
                {section}
              </Typography>
              <div className="rounded-8 bg-surface-float p-3">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {section} content will be rendered here from the rich text
                  editor...
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company and Recruiter sidebars placeholder */}
      <div className="mt-6 grid gap-4 tablet:grid-cols-2">
        <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
          <Typography type={TypographyType.Callout} bold className="mb-2">
            Company
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Company details sidebar will be displayed here
          </Typography>
        </div>

        <div className="rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
          <Typography type={TypographyType.Callout} bold className="mb-2">
            Recruiter
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Recruiter profile sidebar will be displayed here
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default OpportunityLivePreview;
