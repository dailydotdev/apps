import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../../buttons/Button';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import useMedia from '../../../hooks/useMedia';
import { laptop } from '../../../styles/media';

interface CreatePostButtonProps {
  className?: string;
}

export function CreatePostButton({
  className,
}: CreatePostButtonProps): ReactElement {
  const { user, isAuthReady, squads } = useAuthContext();
  const isTablet = !useMedia([laptop.replace('@media ', '')], [true], false);

  if (!user || !isAuthReady || !squads?.length) {
    return null;
  }

  return (
    <Button
      className={classNames('btn-secondary', className)}
      tag="a"
      href={link.post.create}
      buttonSize={isTablet ? ButtonSize.Small : ButtonSize.Medium}
    >
      New post
    </Button>
  );
}
