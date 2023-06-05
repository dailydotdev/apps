import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button } from '../../buttons/Button';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';

interface CreatePostButtonProps {
  className?: string;
}

export function CreatePostButton({
  className,
}: CreatePostButtonProps): ReactElement {
  const { user, isAuthReady, squads } = useAuthContext();

  if (!user || !isAuthReady || !squads?.length) return null;

  return (
    <Button
      className={classNames('btn-secondary', className)}
      tag="a"
      href={link.post.create}
    >
      New post
    </Button>
  );
}
