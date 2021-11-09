import React, { ReactElement } from 'react';
import { getTooltipProps } from '../../lib/tooltip';
import { Button } from './Button';
import MenuIcon from '../../../icons/menu.svg';
import { Post } from '../../graphql/posts';

export default function OptionsButton({
  post,
  onClick,
}: {
  post: Post;
  onClick?: (event: React.MouseEvent, post: Post) => unknown;
}): ReactElement {
  return (
    <Button
      className="mouse:invisible mouse:group-hover:visible my-auto btn-tertiary"
      style={{ marginLeft: 'auto', marginRight: '-0.125rem' }}
      icon={<MenuIcon />}
      onClick={(event) => onClick?.(event, post)}
      buttonSize="small"
      {...getTooltipProps('Options', {
        position: 'left',
      })}
    />
  );
}
