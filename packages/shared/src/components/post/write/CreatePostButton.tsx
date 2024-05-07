import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSquad, useViewSize, ViewSize } from '../../../hooks';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';
import {
  AllowedTags,
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import ConditionalWrapper from '../../ConditionalWrapper';
import { SimpleTooltip } from '../../tooltips';
import { useSquads } from '../../../hooks/squads/useSquads';

interface CreatePostButtonProps {
  className?: string;
  compact?: boolean;
  sidebar?: boolean;
  footer?: boolean;
  onClick?: () => void;
}

export function CreatePostButton({
  className,
  compact,
  sidebar,
  footer,
  onClick,
}: CreatePostButtonProps): ReactElement {
  const { user } = useAuthContext();
  const { squads } = useSquads();
  const { route, query } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const handle = route === '/squads/[handle]' ? (query.handle as string) : '';
  const { squad } = useSquad({ handle });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const hasAccess = squads?.some((item) =>
    verifyPermission(item, SourcePermissions.Post),
  );

  if (!footer && (!user || !squads?.length)) {
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

  const buttonProps: {
    tag?: AllowedTags;
    href?: string;
    onClick?: () => void;
  } = onClick ? { onClick } : { tag: 'a', href };

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
        {...buttonProps}
        variant={
          sidebar || footer ? ButtonVariant.Float : ButtonVariant.Secondary
        }
        className={className}
        disabled={getIsDisabled()}
        icon={compact && <PlusIcon />}
        size={
          isLaptop || sidebar || footer ? ButtonSize.Medium : ButtonSize.Small
        }
      >
        {!compact ? 'New post' : null}
      </Button>
    </ConditionalWrapper>
  );
}
