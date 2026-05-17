import type { ReactElement } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import AuthContext from '../../../contexts/AuthContext';
import {
  getInviteLedgerDemoMode,
  isInviteLedgerDebugEnabled,
  setInviteLedgerDebugEnabled,
  setInviteLedgerDemoMode,
} from '../debug';
import type { InviteLedgerDemoMode } from '../debug';

type SurfaceEntry = {
  id: string;
  label: string;
  description: string;
  demoMode?: NonNullable<InviteLedgerDemoMode>;
  buildHref: (username?: string) => string;
};

const SURFACES: SurfaceEntry[] = [
  {
    id: 'ledger-full',
    label: 'Ledger \u00b7 full',
    description: 'Joined + pending + expired rows, all pills',
    demoMode: 'full',
    buildHref: () => '/settings/referrals',
  },
  {
    id: 'ledger-single',
    label: 'Ledger \u00b7 single',
    description: 'One joined row, drives minimal strip',
    demoMode: 'single',
    buildHref: () => '/settings/referrals',
  },
  {
    id: 'ledger-empty',
    label: 'Ledger \u00b7 empty',
    description: 'No invites copy, no strip, no counter',
    demoMode: 'empty',
    buildHref: () => '/settings/referrals',
  },
  {
    id: 'ledger-real',
    label: 'Ledger \u00b7 real data',
    description: 'Clear fixtures, use account data',
    demoMode: undefined,
    buildHref: () => '/settings/referrals',
  },
  {
    id: 'feed-strip',
    label: 'Feed strip',
    description: 'Home feed with the +2 joined strip',
    demoMode: 'full',
    buildHref: () => '/',
  },
  {
    id: 'feed-strip-single',
    label: 'Feed strip \u00b7 single',
    description: 'Home feed with minimal "+1 joined" variant',
    demoMode: 'single',
    buildHref: () => '/',
  },
  {
    id: 'profile-counter',
    label: 'Profile counter',
    description: 'Pill next to your handle (own profile)',
    demoMode: 'full',
    buildHref: (username) => (username ? `/${username}` : '/'),
  },
  {
    id: 'settings-menu',
    label: 'Settings menu entry',
    description: 'Sidebar "Referrals" link',
    demoMode: 'full',
    buildHref: () => '/settings/profile',
  },
  {
    id: 'legacy-invite',
    label: 'Legacy /settings/invite',
    description: 'Existing invite page (untouched)',
    demoMode: undefined,
    buildHref: () => '/settings/invite',
  },
];

const STRIP_DISMISS_PREFIX = 'inviteLedgerStripDismissed:';

const clearStripDismissals = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(STRIP_DISMISS_PREFIX)) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((key) => window.localStorage.removeItem(key));
};

/**
 * Discreet pinned navigator visible only when the invite ledger demo flag
 * is sticky in localStorage. Lets reviewers jump to every surface state
 * with one click instead of typing URL params.
 */
export const InviteLedgerNavigator = (): ReactElement | null => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<InviteLedgerDemoMode>(null);

  useEffect(() => {
    const sync = () => {
      setVisible(isInviteLedgerDebugEnabled());
      setActiveMode(getInviteLedgerDemoMode());
    };
    sync();
    window.addEventListener('invite-ledger:debug-change', sync);
    window.addEventListener('invite-ledger:demo-mode-change', sync);
    return () => {
      window.removeEventListener('invite-ledger:debug-change', sync);
      window.removeEventListener('invite-ledger:demo-mode-change', sync);
    };
  }, [router?.asPath]);

  if (!user?.id || !visible) {
    return null;
  }

  const goTo = (entry: SurfaceEntry) => {
    if (entry.demoMode !== activeMode) {
      setInviteLedgerDemoMode(entry.demoMode ?? null);
    }
    clearStripDismissals();
    const href = entry.buildHref(user?.username);
    if (router.asPath === href) {
      window.location.reload();
      return;
    }
    router.push(href);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-3 flex flex-col items-end gap-2">
      {open && (
        <div className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-16 border border-border-subtlest-secondary bg-background-default shadow-2 backdrop-blur">
          <header className="flex items-center justify-between border-b border-border-subtlest-secondary px-4 py-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                Invite ledger · demo
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-text-secondary">
                mode:{' '}
                <strong className="text-text-primary">
                  {activeMode ?? 'real'}
                </strong>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              className="rounded p-1 text-text-tertiary hover:bg-surface-float hover:text-text-primary"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {SURFACES.map((entry) => {
              const isActive =
                router.asPath.split('?')[0] ===
                  entry.buildHref(user?.username) &&
                entry.demoMode === activeMode;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => goTo(entry)}
                    className={classNames(
                      'flex w-full flex-col items-start gap-0.5 border-l-2 px-4 py-2 text-left hover:bg-surface-float',
                      isActive
                        ? 'border-action-bookmark-default'
                        : 'border-transparent',
                    )}
                  >
                    <span className="text-text-primary typo-callout">
                      {entry.label}
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {entry.description}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <footer className="flex items-center justify-between border-t border-border-subtlest-secondary px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-tertiary">
            <button
              type="button"
              className="hover:text-text-primary"
              onClick={() => {
                setInviteLedgerDemoMode(null);
                clearStripDismissals();
                window.location.reload();
              }}
            >
              reset state
            </button>
            <button
              type="button"
              className="hover:text-text-primary"
              onClick={() => {
                setInviteLedgerDebugEnabled(false);
                setInviteLedgerDemoMode(null);
                window.location.reload();
              }}
            >
              disable demo
            </button>
          </footer>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={classNames(
          'pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full border border-border-subtlest-secondary px-3 font-mono text-[11px] uppercase tracking-[0.1em] shadow-2 backdrop-blur transition-colors',
          open
            ? 'bg-surface-primary text-text-primary'
            : 'bg-background-default text-text-secondary hover:text-text-primary',
        )}
      >
        <span className="h-2 w-2 rounded-full bg-action-bookmark-default" />
        ledger demo · {activeMode ?? 'real'}
      </button>
    </div>
  );
};
