import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { feature } from '../../../lib/featureManagement';
import { UpvoteIcon } from '../../icons';
import { IconProps, IconSize } from '../../Icon';
import { userPrefersReducedMotions } from '../../../styles/media';
import { useConditionalFeature, useMedia } from '../../../hooks';
import styles from './ActionButtons.module.css';

type AnimatedButtonIconProps = IconProps & { userClicked?: boolean };

const arrows = Array.from({ length: 5 }, (_, i) => i + 1);

export const UpvoteButtonIcon = React.memo(function UpvoteButtonIconComp(
  props: AnimatedButtonIconProps,
): ReactElement {
  const { secondary: isUpvoteActive, userClicked, ...attrs } = props;

  const haveUserPrefersReducedMotions = useMedia(
    [userPrefersReducedMotions.replace('@media', '')],
    [false],
    false,
    false,
  );

  const { value: isAnimatedVersion } = useConditionalFeature({
    feature: feature.animatedUpvote,
    shouldEvaluate:
      !haveUserPrefersReducedMotions && userClicked && isUpvoteActive,
  });

  return (
    <span className="pointer-events-none relative">
      <UpvoteIcon secondary={isUpvoteActive} {...attrs} />
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
});
