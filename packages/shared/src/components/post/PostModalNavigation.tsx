import classNames from 'classnames';
import React, { ReactElement } from 'react';
import FixedPostNavigation from './FixedPostNavigation';
import PostNavigation, {
  PostNavigationClassName,
  PostNavigationProps,
} from './PostNavigation';

interface PostModalNavigationClassName {
  navigation?: PostNavigationClassName;
  fixedNavigation?: PostNavigationClassName;
}

interface PostModalNavigationProps
  extends Omit<PostNavigationProps, 'className'> {
  isFixed?: boolean;
  className?: PostModalNavigationClassName;
}

function PostModalNavigation({
  isFixed,
  className,
  ...props
}: PostModalNavigationProps): ReactElement {
  return (
    <>
      {isFixed && (
        <FixedPostNavigation
          {...props}
          className={{
            container: classNames(
              'max-w-[63.65rem]',
              className?.fixedNavigation?.container,
            ),
            actions: className?.fixedNavigation?.actions,
          }}
        />
      )}
      <PostNavigation
        {...props}
        className={{
          container: classNames('pt-6', className?.navigation?.container),
          actions: className?.navigation?.actions,
        }}
      />
    </>
  );
}

export default PostModalNavigation;
