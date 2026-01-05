import type { ReactElement, ReactNode } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { ArrowIcon, EditIcon } from '../../icons';
import { IconSize } from '../../Icon';

export interface InlineEditorProps {
  title: string;
  description?: string;
  isRequired?: boolean;
  isComplete?: boolean;
  children: ReactNode;
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
  onRemove?: () => Promise<void>;
  isDirty?: boolean;
  isSubmitting?: boolean;
  className?: string;
  defaultExpanded?: boolean;
}

export const InlineEditor = ({
  title,
  description,
  isRequired = false,
  isComplete = true,
  children,
  onSave,
  onDiscard,
  onRemove,
  isDirty = false,
  isSubmitting = false,
  className,
  defaultExpanded = false,
}: InlineEditorProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = useCallback(() => {
    if (isExpanded && isDirty) {
      // If collapsing with unsaved changes, trigger discard
      onDiscard?.();
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded, isDirty, onDiscard]);

  const handleSave = useCallback(async () => {
    await onSave?.();
    setIsExpanded(false);
  }, [onSave]);

  const handleDiscard = useCallback(() => {
    onDiscard?.();
    setIsExpanded(false);
  }, [onDiscard]);

  return (
    <div
      className={classNames(
        'rounded-16 border transition-colors',
        isExpanded
          ? 'border-border-subtlest-secondary bg-surface-float'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
        !isComplete && !isExpanded && 'border-status-warning',
        className,
      )}
    >
      {/* Header - always visible */}
      <button
        type="button"
        className={classNames(
          'flex w-full items-center justify-between p-4',
          isExpanded && 'border-b border-border-subtlest-tertiary',
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <ArrowIcon
            size={IconSize.Small}
            className={classNames(
              'transition-transform',
              isExpanded ? 'rotate-180' : 'rotate-90',
            )}
          />
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <Typography type={TypographyType.Body} bold>
                {title}
              </Typography>
              {isRequired && !isComplete && (
                <span className="rounded-full bg-status-warning px-2 py-0.5 text-white typo-caption2">
                  Required
                </span>
              )}
              {!isRequired && !isComplete && (
                <span className="rounded-full bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption2">
                  Optional
                </span>
              )}
            </div>
            {description && !isExpanded && (
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {description}
              </Typography>
            )}
          </div>
        </div>
        {!isExpanded && (
          <EditIcon size={IconSize.Small} className="text-text-tertiary" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="flex flex-col gap-4 p-4">
          {children}

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-border-subtlest-tertiary pt-4">
            {onRemove ? (
              <Button
                variant={ButtonVariant.Subtle}
                size={ButtonSize.Small}
                onClick={onRemove}
                disabled={isSubmitting}
                className="text-status-error"
              >
                Remove section
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={handleDiscard}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                onClick={handleSave}
                loading={isSubmitting}
                disabled={!isDirty}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineEditor;
