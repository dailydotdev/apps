import React, { ReactElement } from 'react';
import PlaceholderComment from './PlaceholderComment';

export interface PlaceholderCommentListProps {
  placeholderAmount?: number;
}

const MAX_DISPLAY = 5;

export default function PlaceholderCommentList({
  placeholderAmount,
}: PlaceholderCommentListProps): ReactElement {
  const amount =
    placeholderAmount <= MAX_DISPLAY ? placeholderAmount : MAX_DISPLAY;

  return (
    <>
      {Object.keys([...Array(amount)]).map((key) => (
        <PlaceholderComment key={key} />
      ))}
    </>
  );
}
