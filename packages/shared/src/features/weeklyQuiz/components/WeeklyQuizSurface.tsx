import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LogoIcon from '../../../svg/LogoIcon';
import LogoText from '../../../svg/LogoText';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizSurfaceProps {
  children: ReactNode;
  // The intro drops the light beams; every other screen keeps them.
  showRays?: boolean;
  // Element pinned to the far right of the top bar (the intro's week pill).
  headerRight?: ReactNode;
  // The mute + close controls. On mobile the surface goes full-bleed and hosts
  // them itself (inline in the top bar, or overlaid when bare); on desktop the
  // modal keeps its own external side column, so this stays mobile-only.
  controls?: ReactNode;
  // Render as a plain, frameless container — no card surface, top bar or beams.
  // The results screen uses this and supplies its own panels + brand header.
  bare?: boolean;
}

// The daily.dev icon + wordmark lockup, as it appears through the game.
export const WeeklyQuizLogo = (): ReactElement => (
  <span className="opacity-70 pointer-events-none flex shrink-0 items-center gap-1">
    <LogoIcon className={{ container: 'h-5 w-auto' }} />
    <LogoText className={{ container: 'h-5 w-auto' }} />
  </span>
);

// The quiz card shared by every screen: the neutral gradient surface, the
// optional light beams, and a persistent daily.dev wordmark on the top bar.
export const WeeklyQuizSurface = ({
  children,
  showRays = true,
  headerRight,
  controls,
  bare = false,
}: WeeklyQuizSurfaceProps): ReactElement => {
  if (bare) {
    return (
      // `min-w-0` lets this flex item shrink to the viewport instead of being
      // forced wider by the non-wrapping share row (flexbox min-width:auto).
      // `overflow-x-clip` then contains the confetti drift without touching
      // vertical scrolling. Mobile gets a solid fill so the results read as one
      // full-screen surface (like the intro); desktop stays transparent so the
      // panels float in the modal. The bare screen supplies its own top bar
      // (and hosts the mobile controls there), so no header is rendered here.
      <div className="relative min-w-0 flex-1 overflow-x-clip bg-background-default tablet:bg-transparent">
        {children}
      </div>
    );
  }
  return (
    <div
      className={`relative flex-1 border-border-subtlest-secondary tablet:rounded-16 tablet:border ${styles.surface}`}
    >
      {showRays && <span className={styles.rays} aria-hidden />}
      <div className="z-20 relative flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary px-4 pb-3 pt-4">
        <WeeklyQuizLogo />
        <div className="flex items-center gap-2">
          {headerRight}
          {/* Mobile-only: the controls live inside the bar, above the mascot.
              Desktop keeps the modal's external side column instead. */}
          {controls && <span className="flex tablet:hidden">{controls}</span>}
        </div>
      </div>
      {children}
    </div>
  );
};
