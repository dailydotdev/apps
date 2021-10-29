import React, { ReactElement } from 'react';
import { getTooltipProps } from '../../lib/tooltip';
import { Button } from '../buttons/Button';
import MenuIcon from '../../../icons/menu.svg';
import { Post } from '../../graphql/posts';

export default function PostOptions({
  post,
  onClick,
}: {
  post: Post;
  onClick?: (event: React.MouseEvent, post: Post) => unknown;
}): ReactElement {
  return (
    <Button
      className="right-4 my-auto btn-tertiary"
      style={{ position: 'absolute' }}
      icon={<MenuIcon />}
      onClick={(event) => onClick?.(event, post)}
      buttonSize="small"
      {...getTooltipProps('Options', {
        position: 'left',
      })}
    />
  );
}
