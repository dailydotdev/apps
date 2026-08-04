import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LogoIcon from '../../../svg/LogoIcon';
import LogoText from '../../../svg/LogoText';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizSurfaceProps {
  children: ReactNode;
  // The intro drops the light beams; every other screen keeps them.
  showRays?: boolean;
  // Optional element pinned to the right of the top bar, on the logo's line
  // (the intro uses it for the week pill).
  headerRight?: ReactNode;
}

// The quiz card shared by every screen: the neutral gradient surface, the
// optional light beams, and a persistent daily.dev wordmark up top so the brand
// stays present through the whole game.
export const WeeklyQuizSurface = ({
  children,
  showRays = true,
  headerRight,
}: WeeklyQuizSurfaceProps): ReactElement => (
  <div className={`relative flex-1 ${styles.surface}`}>
    {showRays && <span className={styles.rays} aria-hidden />}
    <div className="z-20 relative flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-4 pb-3 pt-4">
      <span className="opacity-70 pointer-events-none flex items-center gap-1">
        <LogoIcon className={{ container: 'h-5 w-auto' }} />
        <LogoText className={{ container: 'h-5 w-auto' }} />
      </span>
      {headerRight}
    </div>
    {children}
  </div>
);
