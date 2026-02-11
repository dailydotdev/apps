import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { PromotedTask, BrandConfig } from '../../lib/brand';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { ProgressBar } from '../fields/ProgressBar';
import {
  VIcon,
  ArrowIcon,
  CoreIcon,
  TwitterIcon,
  GitHubIcon,
  ShareIcon,
  LinkIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { anchorDefaultRel } from '../../lib/strings';
import styles from './PromotedChecklist.module.css';

interface PromotedChecklistProps {
  /** Checklist title */
  title: string;
  /** Checklist description */
  description: string;
  /** List of tasks */
  tasks: PromotedTask[];
  /** Brand configuration for styling */
  brand: Pick<BrandConfig, 'name' | 'logo' | 'colors'>;
  /** Check if task is completed */
  isTaskCompleted: (taskId: string) => boolean;
  /** Handle task completion */
  onCompleteTask: (taskId: string) => void;
  /** Progress percentage */
  progress: number;
  /** Cores earned so far */
  coresEarned: number;
  /** Total possible cores */
  totalReward: number;
  /** Whether all tasks are complete */
  isComplete: boolean;
  /** Custom class name */
  className?: string;
}

const getTaskIcon = (iconType?: string): ReactElement => {
  switch (iconType) {
    case 'x':
    case 'twitter':
      return <TwitterIcon size={IconSize.Medium} />;
    case 'github':
    case 'copilot':
      return <GitHubIcon size={IconSize.Medium} />;
    case 'share':
      return <ShareIcon size={IconSize.Medium} />;
    default:
      return <LinkIcon size={IconSize.Medium} />;
  }
};

/**
 * PromotedChecklist Component
 *
 * Displays a branded checklist of tasks that reward users with cores.
 * Each task can be verified and marked as complete.
 */
export const PromotedChecklist = ({
  title,
  description,
  tasks,
  brand,
  isTaskCompleted,
  onCompleteTask,
  progress,
  coresEarned,
  totalReward,
  isComplete,
  className,
}: PromotedChecklistProps): ReactElement => {
  const handleVerifyTask = useCallback(
    (task: PromotedTask): void => {
      // Open verification URL in new tab
      if (task.verifyUrl) {
        window.open(task.verifyUrl, '_blank', 'noopener,noreferrer');
      }

      // For prototype: mark as complete after a short delay
      // In production, this would verify the action was taken
      setTimeout(() => {
        onCompleteTask(task.id);
      }, 1000);
    },
    [onCompleteTask],
  );

  return (
    <div
      className={classNames(styles.container, className)}
      style={
        brand.colors
          ? {
              '--brand-primary': brand.colors.primary,
              '--brand-secondary': brand.colors.secondary,
            } as React.CSSProperties
          : undefined
      }
    >
      {/* Hero Header */}
      <div className={styles.heroHeader}>
        {/* Falling coins animation */}
        <div className={styles.coinsContainer}>
          {[...Array(5)].map((_, i) => (
            <CoreIcon
              key={i}
              size={IconSize.Medium}
              className={styles.coin}
              style={{ color: brand.colors?.primary }}
            />
          ))}
        </div>

        {brand.logo && (
          <img
            src={brand.logo}
            alt={brand.name}
            className={styles.brandLogo}
          />
        )}

        <div className={styles.heroContent}>
          <div className={styles.heroTitle}>
            <Typography type={TypographyType.Title3} bold>
              {title}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {description}
            </Typography>
          </div>

          <div className={styles.coresDisplay}>
            <CoreIcon
              size={IconSize.Small}
              style={{ color: brand.colors?.primary }}
            />
            <Typography type={TypographyType.Callout} bold>
              <span style={{ color: brand.colors?.primary }}>
                {coresEarned}
              </span>
              <span className="text-text-tertiary">
                {' '}/ {totalReward} Cores
              </span>
            </Typography>
          </div>

          <div className={styles.progressBarWrapper}>
            <ProgressBar
              shouldShowBg
              percentage={progress}
              className={{
                wrapper: 'h-1.5 rounded-8',
                bar: 'h-full rounded-8',
                barColor: styles.progressBar,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className={styles.taskList}>
        {tasks.map((task) => {
          const completed = isTaskCompleted(task.id);

          return (
            <div
              key={task.id}
              className={classNames(styles.taskItem, {
                [styles.taskCompleted]: completed,
              })}
            >
              <div className={styles.taskIcon}>{getTaskIcon(task.icon)}</div>

              <div className={styles.taskContent}>
                <Typography
                  type={TypographyType.Callout}
                  bold
                  className={classNames({
                    'line-through opacity-60': completed,
                  })}
                >
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {task.description}
                  </Typography>
                )}
                <div className={styles.taskReward}>
                  <CoreIcon size={IconSize.XSmall} />
                  <Typography
                    type={TypographyType.Footnote}
                    bold
                    style={{ color: brand.colors?.primary }}
                  >
                    +{task.reward} Cores
                  </Typography>
                </div>
              </div>

              <div className={styles.taskAction}>
                {completed ? (
                  <div
                    className={styles.completedBadge}
                    style={{ backgroundColor: brand.colors?.primary }}
                  >
                    <VIcon size={IconSize.Small} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerifyTask(task)}
                    className={styles.arrowButton}
                    style={{ color: brand.colors?.primary }}
                  >
                    <ArrowIcon size={IconSize.Medium} className="rotate-90" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {isComplete && (
        <div
          className={styles.completionBanner}
          style={
            brand.colors
              ? {
                  background: `linear-gradient(135deg, ${brand.colors.primary}20 0%, ${brand.colors.secondary}20 100%)`,
                  borderColor: brand.colors.primary,
                }
              : undefined
          }
        >
          <Typography type={TypographyType.Callout} bold>
            🎉 Challenge Complete!
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            You&apos;ve earned {totalReward} Cores
          </Typography>
        </div>
      )}

      {/* Sponsored by */}
      <div className="flex items-center justify-center gap-1 pt-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Sponsored by
        </Typography>
        <GitHubIcon size={IconSize.Size16} />
        <Typography type={TypographyType.Footnote} bold>
          {brand.name}
        </Typography>
      </div>
    </div>
  );
};

export default PromotedChecklist;
