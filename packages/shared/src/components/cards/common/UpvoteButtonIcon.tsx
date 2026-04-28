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

// Keep in sync with the `spinAndScale` keyframe duration in UpvoteButtonIcon.module.css
const ROTATION_DURATION_MS = 400;
const BRAND_ICON_VISIBLE_MS = 1200;

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

      // After rotation completes, show brand icon
      const showBrandTimeout = setTimeout(() => {
        if (brandAnimation.brandLogo) {
          setShowBrandIcon(true);
        }
        setIsRotating(false);
      }, ROTATION_DURATION_MS);
      timeoutRefs.current.push(showBrandTimeout);

      // Then hide the brand icon after it has been visible long enough
      const hideBrandTimeout = setTimeout(() => {
        setShowBrandIcon(false);
      }, ROTATION_DURATION_MS + BRAND_ICON_VISIBLE_MS);
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
