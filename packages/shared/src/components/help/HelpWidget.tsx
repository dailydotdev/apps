import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../contexts/AuthContext';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons/Arrow';
import { MiniCloseIcon } from '../icons/MiniClose';
import { SparkleIcon } from '../icons/Sparkle';
import type { HelpGuideItem } from './mockHelpGuideData';
import { mockHelpGuideItems } from './mockHelpGuideData';
import styles from './HelpWidget.module.css';

type WidgetState = 'expanded' | 'minimized';

const COMPLETED_ITEMS_KEY = 'help_widget_completed';
const WIDGET_STATE_KEY = 'help_widget_state';

function getCompletedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_ITEMS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCompletedIds(ids: string[]): void {
  localStorage.setItem(COMPLETED_ITEMS_KEY, JSON.stringify(ids));
}

function getSavedState(): WidgetState {
  return (localStorage.getItem(WIDGET_STATE_KEY) as WidgetState) || 'expanded';
}

interface HelpWidgetProps {
  sidebarExpanded: boolean;
}

export function HelpWidget({
  sidebarExpanded,
}: HelpWidgetProps): ReactElement | null {
  const { user } = useAuthContext();
  const [widgetState, setWidgetState] = useState<WidgetState>('expanded');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCompletedIds(getCompletedIds());
    setWidgetState(getSavedState());
  }, []);

  const pendingItems = mockHelpGuideItems.filter(
    (item) => !completedIds.includes(item.id),
  );
  const pendingCount = pendingItems.length;
  const activeItem = mockHelpGuideItems[activeIndex];

  const isCompleted = activeItem
    ? completedIds.includes(activeItem.id)
    : false;

  const completeItem = useCallback(
    (item: HelpGuideItem) => {
      if (completedIds.includes(item.id)) {
        return;
      }

      const newCompleted = [...completedIds, item.id];
      setCompletedIds(newCompleted);
      saveCompletedIds(newCompleted);
    },
    [completedIds],
  );

  const handleCtaClick = useCallback(
    (item: HelpGuideItem) => {
      completeItem(item);
      if (item.ctaUrl) {
        window.location.href = item.ctaUrl;
      }
    },
    [completeItem],
  );

  const goNext = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % mockHelpGuideItems.length);
      setIsExiting(false);
    }, 150);
  }, []);

  const goPrev = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveIndex(
        (prev) =>
          (prev - 1 + mockHelpGuideItems.length) % mockHelpGuideItems.length,
      );
      setIsExiting(false);
    }, 150);
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      if (index === activeIndex) {
        return;
      }

      setIsExiting(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsExiting(false);
      }, 150);
    },
    [activeIndex],
  );

  const minimize = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setWidgetState('minimized');
      localStorage.setItem(WIDGET_STATE_KEY, 'minimized');
      setPopoverOpen(false);
      setIsExiting(false);
    }, 200);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };

    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverOpen]);

  if (!user) {
    return null;
  }

  // Minimized: show as sidebar item at the bottom
  if (widgetState === 'minimized') {
    return (
      <div ref={triggerRef} className="relative">
        <button
          type="button"
          className={classNames(
            'flex w-full items-center gap-2 rounded-12 transition-colors',
            'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
            sidebarExpanded ? 'h-10 px-3' : 'h-9 justify-center',
          )}
          onClick={() => setPopoverOpen(!popoverOpen)}
          aria-label="Help guide"
        >
          <span className="relative flex size-9 flex-shrink-0 items-center justify-center">
            <span className="typo-callout font-bold text-text-link">?</span>
            {pendingCount > 0 && (
              <span
                className={classNames(
                  styles.notificationDot,
                  'absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full',
                  'bg-accent-bacon-default typo-caption2 font-bold text-white',
                )}
              >
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </span>
          {sidebarExpanded && (
            <span className="flex-1 truncate text-left typo-callout">
              Help guide
            </span>
          )}
        </button>

        {/* Popover — positioned to the right of sidebar */}
        {popoverOpen && (
          <PopoverMenu
            ref={popoverRef}
            items={mockHelpGuideItems}
            completedIds={completedIds}
            onItemClick={(item, index) => {
              setActiveIndex(index);
              setWidgetState('expanded');
              localStorage.setItem(WIDGET_STATE_KEY, 'expanded');
              setPopoverOpen(false);
            }}
            onCtaClick={handleCtaClick}
            className="absolute bottom-0 left-full ml-2"
          />
        )}
      </div>
    );
  }

  if (!activeItem) {
    return null;
  }

  const showNav = mockHelpGuideItems.length > 1;

  // Expanded: show card anchored to sidebar bottom, popping to the right
  return (
    <div ref={triggerRef} className="relative">
      {/* Collapsed sidebar: just show the sparkle icon as trigger */}
      {!sidebarExpanded && (
        <button
          type="button"
          className={classNames(
            'flex h-9 w-full items-center justify-center rounded-12',
            'text-text-link transition-colors hover:bg-surface-hover',
          )}
          onClick={() => setPopoverOpen(!popoverOpen)}
          aria-label="Help guide"
        >
          <span className="relative flex size-9 items-center justify-center">
            <SparkleIcon className="size-5" />
            {pendingCount > 0 && (
              <span
                className={classNames(
                  styles.notificationDot,
                  'absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full',
                  'bg-accent-bacon-default typo-caption2 font-bold text-white',
                )}
              >
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </span>
        </button>
      )}

      {/* Expanded sidebar: show inline preview card */}
      {sidebarExpanded && (
        <button
          type="button"
          className={classNames(
            styles.inlineCard,
            'relative w-full overflow-hidden rounded-12 border border-border-subtlest-tertiary',
            'bg-surface-hover p-3 text-left transition-colors hover:border-border-subtlest-secondary',
          )}
          onClick={() => setPopoverOpen(!popoverOpen)}
        >
          <div className={styles.inlineAccent} />
          <div className="relative flex items-center gap-2">
            <SparkleIcon className="size-4 flex-shrink-0 text-text-link" />
            <span className="flex-1 truncate typo-footnote font-bold text-text-primary">
              {activeItem.title}
            </span>
            {pendingCount > 0 && (
              <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-bacon-default typo-caption2 font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>
          {activeItem.tag && (
            <span
              className={classNames(
                'mt-1.5 inline-block rounded-6 px-1.5 py-0.5 typo-caption2 font-bold',
                activeItem.isNew
                  ? 'bg-accent-bacon-default/16 text-accent-bacon-default'
                  : 'bg-surface-active text-text-quaternary',
              )}
            >
              {activeItem.tag}
            </span>
          )}
        </button>
      )}

      {/* Detail card — pops out to the right of the sidebar */}
      {popoverOpen && (
        <div
          ref={popoverRef}
          className={classNames(
            'absolute bottom-0 left-full ml-2 z-modal',
            isExiting ? styles.cardExit : styles.cardEnter,
          )}
        >
          <DetailCard
            activeItem={activeItem}
            activeIndex={activeIndex}
            isCompleted={isCompleted}
            showNav={showNav}
            completedIds={completedIds}
            onCtaClick={handleCtaClick}
            onClose={() => setPopoverOpen(false)}
            onMinimize={() => {
              minimize();
              setPopoverOpen(false);
            }}
            onNext={goNext}
            onPrev={goPrev}
            onGoToIndex={goToIndex}
          />
        </div>
      )}
    </div>
  );
}

interface DetailCardProps {
  activeItem: HelpGuideItem;
  activeIndex: number;
  isCompleted: boolean;
  showNav: boolean;
  completedIds: string[];
  onCtaClick: (item: HelpGuideItem) => void;
  onClose: () => void;
  onMinimize: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToIndex: (index: number) => void;
}

function DetailCard({
  activeItem,
  activeIndex,
  isCompleted,
  showNav,
  completedIds,
  onCtaClick,
  onClose,
  onMinimize,
  onNext,
  onPrev,
  onGoToIndex,
}: DetailCardProps): ReactElement {
  return (
    <div
      className={classNames(
        styles.card,
        'relative w-80 overflow-hidden rounded-16 border border-border-subtlest-tertiary',
        'bg-background-popover shadow-2',
      )}
    >
      {/* Gradient accent bar */}
      <div className={styles.accentBar} />

      {/* Close button */}
      <Button
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Tertiary}
        icon={<MiniCloseIcon />}
        className="absolute right-3 top-4 z-1 flex-shrink-0"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onMinimize();
        }}
        aria-label="Minimize"
      />

      <div className="relative px-5 pb-2 pt-6">
        {/* Icon + tag row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className={styles.iconGlow} />
            <div className="relative flex size-10 items-center justify-center rounded-12 bg-surface-hover">
              <SparkleIcon className="size-6 text-text-link" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeItem.tag && (
              <span
                className={classNames(
                  styles.tag,
                  'rounded-8 px-2.5 py-1 typo-caption2 font-bold',
                  activeItem.isNew
                    ? 'bg-accent-bacon-default/16 text-accent-bacon-default'
                    : 'bg-surface-hover text-text-tertiary',
                )}
              >
                {activeItem.tag}
              </span>
            )}
            {isCompleted && (
              <span className="rounded-8 bg-action-upvote-float px-2.5 py-1 typo-caption2 font-bold text-action-upvote-default">
                Done
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-3 pr-6 typo-body font-bold text-text-primary">
          {activeItem.title}
        </h3>

        {/* Description */}
        <p className="mt-2 typo-callout leading-relaxed text-text-tertiary">
          {activeItem.description}
        </p>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          {!isCompleted && (
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              className={styles.ctaButton}
              onClick={() => onCtaClick(activeItem)}
            >
              {activeItem.ctaLabel}
              <ArrowIcon className="ml-1 size-4 rotate-90" />
            </Button>
          )}
          {showNav && (
            <div className="ml-auto flex items-center gap-1">
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={onPrev}
                aria-label="Previous tip"
              />
              <span className="typo-caption1 text-text-quaternary">
                {activeIndex + 1}/{mockHelpGuideItems.length}
              </span>
              <Button
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="rotate-90" />}
                onClick={onNext}
                aria-label="Next tip"
              />
            </div>
          )}
        </div>
      </div>

      {/* Step indicator — clickable */}
      {showNav && (
        <div className="flex gap-1.5 px-5 pb-4 pt-3">
          {mockHelpGuideItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={classNames(
                'h-1 flex-1 rounded-16 transition-colors duration-300',
                completedIds.includes(item.id)
                  ? 'bg-text-disabled'
                  : index === activeIndex
                    ? 'bg-text-link'
                    : 'bg-surface-hover',
                'cursor-pointer hover:opacity-80',
              )}
              onClick={() => onGoToIndex(index)}
              aria-label={`Go to tip ${index + 1}: ${item.title}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PopoverMenuProps {
  items: HelpGuideItem[];
  completedIds: string[];
  onItemClick: (item: HelpGuideItem, index: number) => void;
  onCtaClick: (item: HelpGuideItem) => void;
  className?: string;
}

const PopoverMenu = React.forwardRef<HTMLDivElement, PopoverMenuProps>(
  function PopoverMenu(
    { items, completedIds, onItemClick, onCtaClick, className },
    ref,
  ) {
    const pending = items.filter((item) => !completedIds.includes(item.id));
    const completed = items.filter((item) => completedIds.includes(item.id));

    return (
      <div
        ref={ref}
        className={classNames(
          styles.popoverEnter,
          'z-modal w-80 overflow-hidden rounded-16 border border-border-subtlest-tertiary',
          'bg-background-popover shadow-2',
          className,
        )}
      >
        {/* Pending items */}
        {pending.length > 0 && (
          <div className="relative overflow-hidden">
            <div className={styles.popoverHighlight} />
            <div className="relative px-5 py-4">
              <span className="typo-caption2 font-bold uppercase tracking-wider text-text-quaternary">
                Suggested for you
              </span>
              <ul className="mt-3 flex flex-col gap-1">
                {pending.map((item) => {
                  const index = items.indexOf(item);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={classNames(
                          'flex w-full items-center gap-3 rounded-12 px-3 py-2.5',
                          'typo-footnote text-text-secondary',
                          'transition-colors hover:bg-surface-hover hover:text-text-primary',
                        )}
                        onClick={() => onItemClick(item, index)}
                      >
                        <SparkleIcon className="size-4 flex-shrink-0 text-text-link" />
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.isNew && (
                          <span className="rounded-6 bg-accent-bacon-default/16 px-1.5 py-0.5 typo-caption2 font-bold text-accent-bacon-default">
                            New
                          </span>
                        )}
                        <ArrowIcon className="size-3.5 flex-shrink-0 rotate-90 text-text-disabled" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Completed items */}
        {completed.length > 0 && (
          <div
            className={classNames(
              'px-5 py-4',
              pending.length > 0 && 'border-t border-border-subtlest-tertiary',
            )}
          >
            <span className="typo-caption2 font-bold uppercase tracking-wider text-text-quaternary">
              Completed
            </span>
            <ul className="mt-3 flex flex-col gap-1">
              {completed.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <span className="size-4 flex-shrink-0 text-center typo-caption1 text-action-upvote-default">
                    &#10003;
                  </span>
                  <span className="flex-1 typo-footnote text-text-disabled line-through">
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All done state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-8">
            <span className="text-2xl">&#10024;</span>
            <span className="typo-footnote text-text-quaternary">
              You&apos;re all caught up!
            </span>
          </div>
        )}

        {/* Dev-only reset */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="border-t border-border-subtlest-tertiary px-5 py-3">
            <button
              type="button"
              className="typo-caption1 text-text-disabled transition-colors hover:text-text-quaternary"
              onClick={() => {
                localStorage.removeItem(COMPLETED_ITEMS_KEY);
                localStorage.removeItem(WIDGET_STATE_KEY);
                window.location.reload();
              }}
            >
              Reset widget (dev)
            </button>
          </div>
        )}
      </div>
    );
  },
);
