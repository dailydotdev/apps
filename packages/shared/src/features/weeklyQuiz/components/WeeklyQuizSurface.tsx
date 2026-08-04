import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LogoIcon from '../../../svg/LogoIcon';
import LogoText from '../../../svg/LogoText';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizSurfaceProps {
  children: ReactNode;
  // The intro drops the light beams; every other screen keeps them.
  showRays?: boolean;
  // Element pinned to the right of the top bar (the intro's week pill).
  headerRight?: ReactNode;
  // Element filling the left of the top bar (the question's progress + timer).
  headerLeft?: ReactNode;
  // Push the logo to the far right (the question screen), so headerLeft leads.
  logoRight?: boolean;
}

// The quiz card shared by every screen: the neutral gradient surface, the
// optional light beams, and a persistent daily.dev wordmark on the top bar so
// the brand stays present through the whole game.
export const WeeklyQuizSurface = ({
  children,
  showRays = true,
  headerRight,
  headerLeft,
  logoRight = false,
}: WeeklyQuizSurfaceProps): ReactElement => {
  const logo = (
    <span className="opacity-70 pointer-events-none flex shrink-0 items-center gap-1">
      <LogoIcon className={{ container: 'h-5 w-auto' }} />
      <LogoText className={{ container: 'h-5 w-auto' }} />
    </span>
  );

  return (
    <div className={`relative flex-1 ${styles.surface}`}>
      {showRays && <span className={styles.rays} aria-hidden />}
      <div className="z-20 relative flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary px-4 pb-3 pt-4">
        {logoRight ? (
          <>
            <div className="min-w-0 flex-1">{headerLeft}</div>
            {logo}
          </>
        ) : (
          <>
            {logo}
            {headerRight}
          </>
        )}
      </div>
      {children}
    </div>
  );
};
