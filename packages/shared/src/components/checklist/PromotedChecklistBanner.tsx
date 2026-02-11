import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import * as Popover from '@radix-ui/react-popover';
import type { BrandConfig } from '../../lib/brand';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import { usePromotedChecklist } from '../../hooks/usePromotedChecklist';
import { PromotedChecklist } from './PromotedChecklist';
import {
  Typography,
  TypographyType,
} from '../typography/Typography';
import { CoreIcon, MiniCloseIcon } from '../icons';
import { IconSize } from '../Icon';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import styles from './PromotedChecklistBanner.module.css';

interface PromotedChecklistBannerProps {
  /** Custom class name */
  className?: string;
  /** Variant: 'banner' for full width, 'compact' for sidebar widget */
  variant?: 'banner' | 'compact';
}

/**
 * PromotedChecklistBanner Component
 *
 * A promotional banner that opens a popover with the brand checklist.
 * Shows progress and reward info to entice users to complete tasks.
 */
export const PromotedChecklistBanner = ({
  className,
  variant = 'banner',
}: PromotedChecklistBannerProps): ReactElement | null => {
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

  // Don't render if no active brand or checklist
  if (!activeBrand || !checklistConfig) {
    return null;
  }

  // Don't show if already complete (optional - could show completion state instead)
  // if (isComplete) {
  //   return null;
  // }

  const triggerContent =
    variant === 'banner' ? (
      <button
        type="button"
        className={classNames(styles.bannerTrigger, className)}
        style={
          activeBrand.colors
            ? {
                background: `linear-gradient(135deg, ${activeBrand.colors.primary} 0%, ${activeBrand.colors.secondary} 100%)`,
              }
            : undefined
        }
      >
        <div className={styles.bannerContent}>
          {activeBrand.logo && (
            <img
              src={activeBrand.logo}
              alt={activeBrand.name}
              className={styles.bannerLogo}
            />
          )}
          <div className={styles.bannerText}>
            <Typography type={TypographyType.Callout} bold className="text-white">
              {checklistConfig.title}
            </Typography>
            <div className={styles.bannerReward}>
              <CoreIcon size={IconSize.XSmall} className="text-white" />
              <Typography type={TypographyType.Footnote} className="text-white opacity-90">
                Earn up to {checklistConfig.totalReward} Cores
              </Typography>
            </div>
          </div>
          {progress > 0 && (
            <div className={styles.bannerProgress}>
              <Typography type={TypographyType.Footnote} bold className="text-white">
                {progress}%
              </Typography>
            </div>
          )}
        </div>
      </button>
    ) : (
      <button
        type="button"
        className={classNames(styles.compactTrigger, className)}
        style={
          activeBrand.colors
            ? {
                borderColor: `${activeBrand.colors.primary}40`,
                background: `linear-gradient(135deg, ${activeBrand.colors.primary}10 0%, ${activeBrand.colors.secondary}10 100%)`,
              }
            : undefined
        }
      >
        <div className={styles.compactHeader}>
          {activeBrand.logo && (
            <img
              src={activeBrand.logo}
              alt={activeBrand.name}
              className={styles.compactLogo}
            />
          )}
          <Typography type={TypographyType.Callout} bold>
            {checklistConfig.title}
          </Typography>
        </div>
        <Typography type={TypographyType.Footnote} className="text-text-tertiary mb-2">
          Complete tasks to earn Cores!
        </Typography>
        <div className={styles.compactProgress}>
          <div
            className={styles.compactProgressBar}
            style={
              activeBrand.colors
                ? { backgroundColor: `${activeBrand.colors.primary}30` }
                : undefined
            }
          >
            <div
              className={styles.compactProgressFill}
              style={{
                width: `${progress}%`,
                backgroundColor: activeBrand.colors?.primary,
              }}
            />
          </div>
          <div className={styles.compactReward}>
            <CoreIcon size={IconSize.XSmall} />
            <Typography
              type={TypographyType.Footnote}
              bold
              style={{ color: activeBrand.colors?.primary }}
            >
              {coresEarned}/{checklistConfig.totalReward}
            </Typography>
          </div>
        </div>
      </button>
    );

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>{triggerContent}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popoverContent}
          sideOffset={8}
          align="center"
          side={variant === 'banner' ? 'bottom' : 'left'}
        >
          <div className={styles.popoverHeader}>
            <Popover.Close asChild>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<MiniCloseIcon size={IconSize.Small} />}
                className={styles.closeButton}
              />
            </Popover.Close>
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

          <Popover.Arrow className={styles.popoverArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default PromotedChecklistBanner;
