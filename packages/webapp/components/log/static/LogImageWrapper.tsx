import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import styles from './StaticCards.module.css';

interface LogImageWrapperProps {
  children: ReactNode;
  /** Optional archetype color for themed backgrounds */
  archetypeColor?: string;
  /** User profile image URL */
  userImage?: string;
  /** Username to display */
  username?: string;
}

/**
 * Wrapper component for Log share images.
 * Fixed 1080x1920px dimensions (9:16 story format).
 * Includes daily.dev logo at top, user profile, and URL at bottom.
 */
export default function LogImageWrapper({
  children,
  archetypeColor,
  userImage,
  username,
}: LogImageWrapperProps): ReactElement {
  return (
    <div
      className={styles.imageWrapper}
      style={
        archetypeColor
          ? ({ '--archetype-color': archetypeColor } as React.CSSProperties)
          : undefined
      }
    >
      {/* Background burst effect */}
      <div className={styles.backgroundBurst} />

      {/* Decorative stars */}
      <div className={styles.decorations}>
        <span
          className={styles.star}
          style={{ top: '8%', left: '10%', color: '#FFE923' }}
        >
          ✦
        </span>
        <span
          className={styles.star}
          style={{ top: '15%', right: '12%', color: '#ACF535' }}
        >
          ★
        </span>
        <span
          className={styles.star}
          style={{ bottom: '20%', left: '8%', color: '#CE3DF3' }}
        >
          ✴
        </span>
        <span
          className={styles.star}
          style={{ bottom: '12%', right: '10%', color: '#FF8E3B' }}
        >
          ✦
        </span>
      </div>

      {/* Header with logo and user profile */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <LogoIcon className={{ container: styles.logoIcon }} />
          <LogoText className={{ container: styles.logoText }} />
        </div>
        <div className={styles.yearBadge}>2025</div>
      </div>

      {/* User profile section */}
      {(userImage || username) && (
        <div className={styles.userProfile}>
          {userImage && (
            <img
              src={userImage}
              alt={username || 'User'}
              className={styles.userAvatar}
            />
          )}
          {username && (
            <span className={styles.username}>@{username}</span>
          )}
        </div>
      )}

      {/* Card content */}
      <div className={styles.content}>{children}</div>

      {/* Footer with URL */}
      <div className={styles.footer}>
        <span className={styles.footerUrl}>app.daily.dev/log</span>
      </div>
    </div>
  );
}
