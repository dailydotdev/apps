import type { ReactElement } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { UpvoteIcon } from '../../icons';
import type { IconProps } from '../../Icon';
import { IconSize, iconSizeToClassName } from '../../Icon';
import { BrandedUpvoteAnimation } from '../../brand/BrandedUpvoteAnimation';
import type { BrandColors, UpvoteAnimationConfig } from '../../../lib/brand';
import styles from './UpvoteButtonIcon.module.css';

interface UpvoteButtonIconProps extends IconProps {
  /** Post tags to check for brand sponsorship */
  postTags?: string[];
  /** Brand animation config (passed from parent) */
  brandAnimation?: {
    colors: BrandColors;
    config: UpvoteAnimationConfig;
    brandLogo: string | null;
  } | null;
}

export const UpvoteButtonIcon = React.memo(function UpvoteButtonIconComp(
  props: UpvoteButtonIconProps,
): ReactElement {
  const {
    secondary: isUpvoteActive,
    brandAnimation,
    size = IconSize.XSmall,
    ...attrs
  } = props;
  const [showAnimation, setShowAnimation] = useState(false);
  const [showBrandIcon, setShowBrandIcon] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const prevActiveRef = useRef(isUpvoteActive);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutRefs.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Trigger animation when transitioning from inactive to active
  useEffect(() => {
    if (isUpvoteActive && !prevActiveRef.current && brandAnimation) {
      // Start particle animation
      setShowAnimation(true);

      // Start rotation animation
      setIsRotating(true);

      // After rotation completes (400ms), show brand icon
      const showBrandTimeout = setTimeout(() => {
        if (brandAnimation.brandLogo) {
          setShowBrandIcon(true);
        }
        setIsRotating(false);
      }, 400);
      timeoutRefs.current.push(showBrandTimeout);

      // After showing brand icon for 1.2s, switch back to upvote icon
      const hideBrandTimeout = setTimeout(() => {
        setShowBrandIcon(false);
      }, 1600);
      timeoutRefs.current.push(hideBrandTimeout);
    }
    prevActiveRef.current = isUpvoteActive;
  }, [isUpvoteActive, brandAnimation]);

  const handleAnimationComplete = (): void => {
    setShowAnimation(false);
  };

  const hasBrandLogo = brandAnimation?.brandLogo;

  return (
    <span className="pointer-events-none relative">
      <span
        className={classNames(
          styles.iconWrapper,
          isRotating && styles.rotating,
        )}
      >
        {/* Brand icon - shown after rotation */}
        {showBrandIcon && hasBrandLogo ? (
          <img
            src={brandAnimation.brandLogo}
            alt=""
            className={classNames(
              styles.brandIcon,
              iconSizeToClassName[size],
              'rounded-full object-cover',
            )}
          />
        ) : (
          <UpvoteIcon secondary={isUpvoteActive} size={size} {...attrs} />
        )}
      </span>

      {/* Branded upvote animation (particles) */}
      {brandAnimation && (
        <BrandedUpvoteAnimation
          isActive={showAnimation}
          colors={brandAnimation.colors}
          config={brandAnimation.config}
          onComplete={handleAnimationComplete}
        />
      )}
    </span>
  );
});
