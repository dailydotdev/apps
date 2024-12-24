import type { ReactElement } from 'react';
import React from 'react';
import type { PlaceholderCommentProps } from './PlaceholderComment';
import PlaceholderComment from './PlaceholderComment';

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
