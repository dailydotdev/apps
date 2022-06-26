import React, { ReactElement } from 'react';
import { CardButton } from './Card';

export type PostButtonProps = {
  title: string;
  onClick?: (e?: React.MouseEvent) => unknown;
};

export default function PostButton({
  title,
  onClick,
}: PostButtonProps): ReactElement {
  return (
    <CardButton
      title={title}
      onClick={onClick}
      onMouseUp={(event) => event.button === 1 && onClick?.(event)}
    />
  );
}
