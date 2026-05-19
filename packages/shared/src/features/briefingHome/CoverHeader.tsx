import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { MenuIcon, EyeCancelIcon, ArrowIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { briefCopy } from './copy';

interface CoverHeaderProps {
  edition: number;
  totals: {
    total: number;
    readMinutes: number;
  };
  sourceCount: number;
  onCollapse: () => void;
  onHide: () => void;
  skipAnchor: string;
}

const greetingFor = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return briefCopy.greeting.morning(name);
  }
  if (hour < 18) {
    return briefCopy.greeting.afternoon(name);
  }
  return briefCopy.greeting.evening(name);
};

const formatDate = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const TABS = [
  {
    id: 'brief',
    label: briefCopy.tabBriefing,
    hint: briefCopy.tabBriefingHint,
    anchor: '#brief-top',
  },
  {
    id: 'feed',
    label: briefCopy.tabFeed,
    hint: briefCopy.tabFeedHint,
    anchor: '#brief-end',
  },
] as const;

export const CoverHeader = ({
  edition,
  totals,
  sourceCount,
  onCollapse,
  onHide,
  skipAnchor,
}: CoverHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'brief' | 'feed'>('brief');
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(
    () => user?.name?.split(' ')[0] || user?.username || 'there',
    [user],
  );

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const onTabClick = useCallback(
    (tabId: 'brief' | 'feed', anchor: string) => {
      setActiveTab(tabId);
      if (typeof document === 'undefined') {
        return;
      }
      const target =
        anchor === '#brief-end'
          ? document.querySelector(skipAnchor)
          : document.getElementById('brief-top');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [skipAnchor],
  );

  return (
    <header id="brief-top" className="flex flex-col gap-5 pt-4">
      <div className="flex items-start justify-between gap-3">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          bold
          className="uppercase tracking-[0.16em]"
        >
          {formatDate()} · {briefCopy.editionLabel(edition)}
        </Typography>
        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MenuIcon />}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={briefCopy.moreActions}
          />
          <div
            role="menu"
            className={classNames(
              'absolute right-0 z-tooltip mt-1 min-w-[12rem] origin-top-right rounded-12 border border-border-subtlest-secondary bg-background-popover p-1 shadow-3 transition-all',
              menuOpen
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0',
            )}
          >
            <button
              type="button"
              onClick={() => {
                onCollapse();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-8 px-2 py-2 text-left transition-colors hover:bg-surface-float"
            >
              <ArrowIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
              >
                {briefCopy.controlCollapse}
              </Typography>
            </button>
            <button
              type="button"
              onClick={() => {
                onHide();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-8 px-2 py-2 text-left transition-colors hover:bg-surface-float"
            >
              <EyeCancelIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
              />
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
              >
                {briefCopy.controlHide}
              </Typography>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!leading-[1.05] tracking-[-0.03em]"
        >
          {greetingFor(displayName)}
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
          className="max-w-[42rem] !leading-snug"
        >
          {briefCopy.heroDeck(totals.total, totals.readMinutes)}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          {briefCopy.briefMetaLine(totals.readMinutes, sourceCount)}
        </Typography>
      </div>

      <nav
        aria-label="Brief sections"
        className="inline-flex w-full max-w-md items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-1"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id, tab.anchor)}
              className={classNames(
                'group flex flex-1 flex-col items-start gap-0.5 rounded-10 px-3 py-2 text-left transition-colors',
                isActive
                  ? 'shadow-1 bg-background-default'
                  : 'hover:bg-surface-float',
              )}
              aria-pressed={isActive}
            >
              <Typography
                type={TypographyType.Footnote}
                bold
                color={
                  isActive ? TypographyColor.Primary : TypographyColor.Tertiary
                }
              >
                {tab.label}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={
                  isActive
                    ? TypographyColor.Tertiary
                    : TypographyColor.Quaternary
                }
              >
                {tab.hint}
              </Typography>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
