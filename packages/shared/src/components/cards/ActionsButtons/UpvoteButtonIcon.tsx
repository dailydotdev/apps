import React, { ReactElement } from 'react';
import { UpvoteIcon } from '../../icons';
import { IconProps } from '../../Icon';

export const UpvoteButtonIcon = React.memo(function UpvoteButtonIconComp(
  props: IconProps,
): ReactElement {
  const { secondary: isUpvoteActive, ...attrs } = props;

  return (
    <span className="pointer-events-none relative">
      <UpvoteIcon secondary={isUpvoteActive} {...attrs} />
    </span>
  );
});
