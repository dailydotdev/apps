import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { PostNavigationProps } from './common';

const SimpleTooltip = dynamic(
  () =>
    import(/* webpackChunkName: "simpleTooltip" */ '../tooltips/SimpleTooltip'),
);

type PostPreviousNextProps = Pick<
  PostNavigationProps,
  'onPreviousPost' | 'onNextPost'
>;
export function PostPreviousNext({
  onPreviousPost,
  onNextPost,
}: PostPreviousNextProps): ReactElement {
  return (
    <>
      {onPreviousPost && (
        <SimpleTooltip content="Previous">
          <Button
            className="-rotate-90 btn-secondary"
            icon={<ArrowIcon />}
            onClick={onPreviousPost}
          />
        </SimpleTooltip>
      )}
      {onNextPost && (
        <SimpleTooltip content="Next">
          <Button
            className="rotate-90 btn-secondary"
            icon={<ArrowIcon />}
            onClick={onNextPost}
          />
        </SimpleTooltip>
      )}
    </>
  );
}
