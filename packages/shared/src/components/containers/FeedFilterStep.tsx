import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';

interface ClassName {
  container?: string;
  content?: string;
}

interface FeedFilterStepProps {
  topIcon?: ReactNode;
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  className?: ClassName;
}

const FeedFilterHeading = classed(
  'h3',
  'text-center typo-title2 font-bold px-4',
);

function FeedFilterStep({
  topIcon,
  title,
  description,
  children,
  className = {},
}: FeedFilterStepProps): ReactElement {
  return (
    <div className={classNames('flex flex-col', className.container)}>
      {topIcon}
      {typeof title !== 'string' ? (
        title
      ) : (
        <FeedFilterHeading>{title}</FeedFilterHeading>
      )}
      {description && (
        <p className="px-6 mt-3 text-center text-theme-label-secondary typo-body">
          {description}
        </p>
      )}
      <div className={className.content}>{children}</div>
    </div>
  );
}

export default FeedFilterStep;
