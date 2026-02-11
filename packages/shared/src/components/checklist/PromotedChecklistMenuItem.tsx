import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import * as Popover from '@radix-ui/react-popover';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import { usePromotedChecklist } from '../../hooks/usePromotedChecklist';
import { PromotedChecklist } from './PromotedChecklist';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { CoreIcon, MiniCloseIcon, ArrowIcon, GitHubIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import styles from './PromotedChecklistBanner.module.css';
import menuStyles from './PromotedChecklistMenuItem.module.css';

interface PromotedChecklistMenuItemProps {
  /** Custom class name */
  className?: string;
}

/**
 * PromotedChecklistMenuItem Component
 *
 * A compact menu item styled prompt for the ProfileMenu that opens the promoted checklist.
 * Shows brand logo, "Earn Cores" message, and progress indicator.
 */
export const PromotedChecklistMenuItem = ({
  className,
}: PromotedChecklistMenuItemProps): ReactElement | null => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeBrand, getPromotedChecklist } = useBrandSponsorship();
  const checklistConfig = getPromotedChecklist();

  const {
    isTaskCompleted,
    completeTask,
    progress,
    coresEarned,
    isComplete,
  } = usePromotedChecklist(checklistConfig);

  const handleOpenChange = useCallback((open: boolean): void => {
    setIsOpen(open);
  }, []);

  const handleTriggerClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  // Don't render if no active brand or checklist
  if (!activeBrand || !checklistConfig) {
    return null;
  }

  const remainingCores = checklistConfig.totalReward - coresEarned;

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={handleTriggerClick}
          className={classNames(
            'relative flex w-full items-center gap-2.5 rounded-12 p-2 transition-all',
            'hover:scale-[1.02] active:scale-[0.98]',
            className,
          )}
          style={{
            background: activeBrand.colors
              ? `linear-gradient(135deg, ${activeBrand.colors.primary}15 0%, ${activeBrand.colors.secondary}15 100%)`
              : undefined,
            border: `1px solid ${activeBrand.colors?.primary}30`,
          }}
        >
          {/* Falling coins animation */}
          <div className={menuStyles.coinsContainer}>
            {[...Array(5)].map((_, i) => (
              <CoreIcon
                key={i}
                size={IconSize.Small}
                className={menuStyles.coin}
                style={{ color: activeBrand.colors?.primary }}
              />
            ))}
          </div>

          {/* Brand Logo */}
          <CoreIcon size={IconSize.Large} />

          {/* Text Content */}
          <div className="flex flex-1 flex-col items-start">
            <div className="flex items-center gap-1.5">
              <Typography
                type={TypographyType.Callout}
                bold
                className="text-accent-onion-default"
              >
                {isComplete ? 'Challenge Complete!' : `Earn ${remainingCores} Cores`}
              </Typography>
            </div>
            <div className="flex items-center gap-1">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Sponsored by
              </Typography>
              <GitHubIcon size={IconSize.Size16} />
              <Typography type={TypographyType.Footnote} bold>
                {activeBrand.name}
              </Typography>
            </div>
          </div>

          {/* Progress/Arrow */}
          <div className="flex items-center gap-2">
            {progress > 0 && !isComplete && (
              <div
                className="flex size-7 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: activeBrand.colors?.primary }}
              >
                <Typography type={TypographyType.Caption1} bold>
                  {progress}%
                </Typography>
              </div>
            )}
            <ArrowIcon
              size={IconSize.Small}
              className="text-text-quaternary"
              style={{ transform: 'rotate(90deg)' }}
            />
          </div>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <div className={styles.portalContainer}>
          {/* Backdrop overlay */}
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* Custom centered content - not using Popover.Content to avoid Radix positioning */}
          <div
            className={styles.popoverContent}
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.popoverHeader}>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<MiniCloseIcon size={IconSize.Small} />}
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
              />
            </div>

            <PromotedChecklist
              title={checklistConfig.title}
              description={checklistConfig.description}
              tasks={checklistConfig.tasks}
              brand={{
                name: activeBrand.name,
                logo: activeBrand.logo,
                colors: activeBrand.colors,
              }}
              isTaskCompleted={isTaskCompleted}
              onCompleteTask={completeTask}
              progress={progress}
              coresEarned={coresEarned}
              totalReward={checklistConfig.totalReward}
              isComplete={isComplete}
            />
          </div>
        </div>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default PromotedChecklistMenuItem;
