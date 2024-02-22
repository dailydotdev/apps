import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSquad, useViewSize, ViewSize } from '../../../hooks';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

interface CreatePostButtonProps {
  className?: string;
}

export function CreatePostButton({
  className,
}: CreatePostButtonProps): ReactElement {
  const { user, isAuthReady, squads } = useAuthContext();
  const { route, query } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
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
      variant={ButtonVariant.Secondary}
      className={className}
      disabled={getIsDisabled()}
      tag="a"
      href={
        link.post.create +
        (squad && allowedToPost ? `?sid=${squad.handle}` : '')
      }
      size={isLaptop ? ButtonSize.Medium : ButtonSize.Small}
    >
      New post
    </Button>
  );
}
