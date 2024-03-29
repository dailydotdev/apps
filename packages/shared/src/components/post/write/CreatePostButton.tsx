import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSquad, useViewSize, ViewSize } from '../../../hooks';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import ConditionalWrapper from '../../ConditionalWrapper';
import { SimpleTooltip } from '../../tooltips';

interface CreatePostButtonProps {
  className?: string;
  compact?: boolean;
  sidebar?: boolean;
}

export function CreatePostButton({
  className,
  compact,
  sidebar,
}: CreatePostButtonProps): ReactElement {
  const { user, squads } = useAuthContext();
  const { route, query } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const handle = route === '/squads/[handle]' ? (query.handle as string) : '';
  const { squad } = useSquad({ handle });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const hasAccess = squads?.some((item) =>
    verifyPermission(item, SourcePermissions.Post),
  );

  if (!user || !squads?.length) {
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

  const href =
    link.post.create + (squad && allowedToPost ? `?sid=${squad.handle}` : '');

  return (
    <ConditionalWrapper
      condition={compact}
      wrapper={(component: ReactElement) => (
        <SimpleTooltip placement="bottom" content="New Post">
          {component}
        </SimpleTooltip>
      )}
    >
      <Button
        variant={sidebar ? ButtonVariant.Float : ButtonVariant.Secondary}
        className={className}
        disabled={getIsDisabled()}
        icon={compact && <PlusIcon />}
        tag="a"
        size={isLaptop || sidebar ? ButtonSize.Medium : ButtonSize.Small}
        href={href}
      >
        {!compact ? 'New post' : null}
      </Button>
    </ConditionalWrapper>
  );
}
