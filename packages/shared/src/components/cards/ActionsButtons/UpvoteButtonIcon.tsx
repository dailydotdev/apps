import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { withExperiment } from '../../withExperiment';
import { feature } from '../../../lib/featureManagement';
import { UpvoteIcon } from '../../icons';
import { IconProps, IconSize } from '../../Icon';
import { userPrefersReducedMotions } from '../../../styles/media';
import { useMedia } from '../../../hooks';
import styles from './ActionButtons.module.css';

type AnimatedButtonIconProps = IconProps & { userClicked?: boolean };

const arrows = Array.from({ length: 5 }, (_, i) => i + 1);

const AnimatedButtonIcon = (props: AnimatedButtonIconProps): ReactElement => {
  const { secondary: isUpvoteActive, userClicked } = props;

  return (
    <span className="pointer-events-none relative">
      <UpvoteIcon secondary={isUpvoteActive} />
      {userClicked && isUpvoteActive && (
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

const AnimatedUpvoteButtonIcon = React.memo(
  function AnimatedUpvoteButtonIconComp(
    props: AnimatedButtonIconProps,
  ): ReactElement {
    const haveUserPrefersReducedMotions = useMedia(
      [userPrefersReducedMotions.replace('@media', '')],
      [false],
      false,
      false,
    );

    const Experiment = withExperiment(AnimatedButtonIcon, {
      feature: feature.animatedUpvote,
      value: true,
      fallback: () => <UpvoteIcon secondary={props.secondary} />,
      shouldEvaluate: !haveUserPrefersReducedMotions,
    });

    return <Experiment {...props} />;
  },
);

export { AnimatedUpvoteButtonIcon as UpvoteButtonIcon };
