import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { withExperiment } from '../../withExperiment';
import { feature } from '../../../lib/featureManagement';
import { UpvoteIcon } from '../../icons';
import { IconProps, IconSize } from '../../Icon';
import { userPrefersReducedMotions } from '../../../styles/media';
import { useConditionalFeature, useMedia } from '../../../hooks';
import styles from './ActionButtons.module.css';

function useAnimatedActionButtons(options: { isUpvoteActive: boolean }) {
  const { isUpvoteActive } = options;
  const initialUpvote = useRef(isUpvoteActive);
  const [userClicked, setUserClickedUpvote] = useState(false);

  const haveUserPrefersReducedMotions = useMedia(
    [userPrefersReducedMotions.replace('@media', '')],
    [false],
    false,
    false,
  );
  const currentVersion = useConditionalFeature({
    feature: feature.animatedUpvote,
    shouldEvaluate: !haveUserPrefersReducedMotions,
  });
  const isAnimatedVersion = !!currentVersion?.value;

  useEffect(() => {
    if (isUpvoteActive !== initialUpvote?.current) {
      setUserClickedUpvote(true);
    }
  }, [isUpvoteActive]);

  return { isAnimatedVersion, userClicked, setUserClickedUpvote };
}

const UpvoteButtonIcon = (props: IconProps) => {
  const { secondary: isUpvoteActive } = props;
  const { isAnimatedVersion, userClicked } = useAnimatedActionButtons({
    isUpvoteActive,
  });

  const arrows = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <span className="pointer-events-none relative">
      <UpvoteIcon secondary={isUpvoteActive} />
      {isAnimatedVersion && userClicked && isUpvoteActive && (
        <span
          aria-hidden
          className={classNames(
            styles.upvotes,
            'absolute left-1/2 top-0 h-full w-[125%] -translate-x-1/2',
          )}
          role="presentation"
        >
          {arrows.map((i) => (
            <UpvoteIcon
              secondary
              size={IconSize.XXSmall}
              className={styles.upvote}
              key={i}
            />
          ))}
        </span>
      )}
    </span>
  );
};

const AnimatedUpvoteButtonIcon = withExperiment(UpvoteButtonIcon, {
  feature: feature.animatedUpvote,
  value: true,
  fallback: UpvoteIcon,
});

export { AnimatedUpvoteButtonIcon as UpvoteButtonIcon };
