import React, { ReactElement } from 'react';
import { Button } from './Button';
import MenuIcon from '../icons/Menu';
import { Post } from '../../graphql/posts';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export default function OptionsButton({
  post,
  onClick,
}: {
  post: Post;
  onClick?: (event: React.MouseEvent, post: Post) => unknown;
}): ReactElement {
  return (
    <SimpleTooltip placement="left" content="Options">
      <Button
        className="mouse:invisible mouse:group-hover:visible my-auto btn-tertiary"
        style={{ marginLeft: 'auto', marginRight: '-0.125rem' }}
        icon={<MenuIcon />}
        onClick={(event) => onClick?.(event, post)}
        buttonSize="small"
      />
    </SimpleTooltip>
  );
}
