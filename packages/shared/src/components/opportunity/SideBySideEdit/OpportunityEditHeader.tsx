import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../utilities/Link';
import { Button, ButtonVariant, ButtonSize } from '../../buttons/Button';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { ArrowIcon, RefreshIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { OpportunityState } from '../../../features/opportunity/protobuf/opportunity';
import { webappUrl } from '../../../lib/constants';

export interface OpportunityEditHeaderProps {
  /**
   * Job title to display
   */
  title: string;
  /**
   * Current opportunity state (DRAFT, LIVE, etc.)
   */
  state: OpportunityState;
  /**
   * Callback when Save button is clicked
   */
  onSave: () => void;
  /**
   * Callback when Update from URL button is clicked
   */
  onUpdateFromUrl: () => void;
  /**
   * Whether the save operation is in progress
   */
  isSaving?: boolean;
  /**
   * Whether save was successful (shows checkmark)
   */
  isSaved?: boolean;
  /**
   * Whether there are unsaved changes
   */
  hasUnsavedChanges?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

function getStateLabel(state: OpportunityState): string {
  switch (state) {
    case OpportunityState.DRAFT:
      return 'DRAFT';
    case OpportunityState.LIVE:
      return 'LIVE';
    case OpportunityState.CLOSED:
      return 'CLOSED';
    case OpportunityState.IN_REVIEW:
      return 'IN REVIEW';
    default:
      return 'DRAFT';
  }
}

function getStateBadgeClass(state: OpportunityState): string {
  switch (state) {
    case OpportunityState.DRAFT:
      return 'bg-status-warning text-white';
    case OpportunityState.LIVE:
      return 'bg-status-success text-white';
    case OpportunityState.CLOSED:
      return 'bg-text-disabled text-white';
    case OpportunityState.IN_REVIEW:
      return 'bg-status-info text-white';
    default:
      return 'bg-status-warning text-white';
  }
}

/**
 * Header for the side-by-side opportunity edit page.
 *
 * Contains:
 * - Back button to dashboard
 * - Job title
 * - Status badge (DRAFT/LIVE)
 * - Update from URL button
 * - Save button with states
 */
export function OpportunityEditHeader({
  title,
  state,
  onSave,
  onUpdateFromUrl,
  isSaving = false,
  isSaved = false,
  hasUnsavedChanges = false,
  className,
}: OpportunityEditHeaderProps): ReactElement {
  const getSaveButtonText = () => {
    if (isSaving) {
      return 'Saving...';
    }
    if (isSaved && !hasUnsavedChanges) {
      return 'Saved ✓';
    }
    return 'Save';
  };

  return (
    <header
      className={classNames(
        'z-20 sticky top-0 flex items-center justify-between gap-4 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3',
        className,
      )}
    >
      {/* Left side: Back button + Title + Status */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href={`${webappUrl}recruiter`}>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="shrink-0"
          >
            <ArrowIcon className="rotate-180" size={IconSize.Small} />
            <span className="hidden tablet:inline">Dashboard</span>
          </Button>
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            className="truncate"
            bold
          >
            {title || 'Untitled Job'}
          </Typography>

          <span
            className={classNames(
              'rounded shrink-0 px-2 py-0.5 text-xs font-bold',
              getStateBadgeClass(state),
            )}
          >
            {getStateLabel(state)}
          </span>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={onUpdateFromUrl}
        >
          <RefreshIcon size={IconSize.Small} />
          <span className="hidden tablet:inline">Update from URL</span>
        </Button>

        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSave}
          disabled={isSaving}
          className="relative"
        >
          {hasUnsavedChanges && !isSaving && !isSaved && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-cabbage-default" />
          )}
          {getSaveButtonText()}
        </Button>
      </div>
    </header>
  );
}

export default OpportunityEditHeader;
