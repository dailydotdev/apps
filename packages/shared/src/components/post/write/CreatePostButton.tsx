import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Button, ButtonSize } from '../../buttons/Button';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import useMedia from '../../../hooks/useMedia';
import { laptop } from '../../../styles/media';
import { useSquad } from '../../../hooks';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';

interface CreatePostButtonProps {
  className?: string;
}

export function CreatePostButton({
  className,
}: CreatePostButtonProps): ReactElement {
  const { user, isAuthReady, squads } = useAuthContext();
  const { route, query } = useRouter();
  const isTablet = !useMedia([laptop.replace('@media ', '')], [true], false);

  const handle = route === '/squads/[handle]' ? (query.handle as string) : '';
  const { squad } = useSquad({ handle });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);

  if (!user || !isAuthReady || !squads?.length) {
    return null;
  }

  return (
    <Button
      className={classNames('btn-secondary', className)}
      tag="a"
      href={
        link.post.create +
        (squad && allowedToPost ? `?sid=${squad.handle}` : '')
      }
      buttonSize={isTablet ? ButtonSize.Small : ButtonSize.Medium}
    >
      New post
    </Button>
  );
}
