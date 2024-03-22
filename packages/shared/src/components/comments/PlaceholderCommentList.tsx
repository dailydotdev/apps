import React, { ReactElement } from 'react';
import PlaceholderComment, {
  PlaceholderCommentProps,
} from './PlaceholderComment';

export interface PlaceholderCommentListProps extends PlaceholderCommentProps {
  placeholderAmount?: number;
}

const MAX_DISPLAY = 5;

export default function PlaceholderCommentList({
  placeholderAmount,
  ...props
}: PlaceholderCommentListProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <>
      {Object.keys([...Array(amount)]).map((key) => (
        <PlaceholderComment {...props} key={key} />
      ))}
    </>
  );
}
