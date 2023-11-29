import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Button, ButtonSize } from '../../buttons/Button';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSquad, useViewSize, ViewSize } from '../../../hooks';
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
  const isTablet = useViewSize(ViewSize.Tablet);
  const handle = route === '/squads/[handle]' ? (query.handle as string) : '';
  const { squad } = useSquad({ handle });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const hasAccess = squads?.some((item) =>
    verifyPermission(item, SourcePermissions.Post),
  );

  if (!user || !isAuthReady || !squads?.length) {
    return null;
  }

  const getIsDisabled = () => {
    if (!hasAccess) {
      return true;
    }

    if (!handle) {
      return false;
    }

    return !allowedToPost;
  };

  return (
    <Button
      className={classNames('btn-secondary', className)}
      disabled={getIsDisabled()}
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
