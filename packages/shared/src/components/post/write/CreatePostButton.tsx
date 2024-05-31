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
  const { user, squads } = useAuthContext();
  const { route, query } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isLaptopL = useViewSize(ViewSize.LaptopL);
  const handle = route === '/squads/[handle]' ? (query.handle as string) : '';
  const { squad } = useSquad({ handle });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const hasAccess =
    !handle ||
    squads?.some((item) => verifyPermission(item, SourcePermissions.Post));

  if (!footer && !user) {
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

  const shouldShowAsCompact = (isLaptop && !isLaptopL) || compact;

  return (
    <ConditionalWrapper
      condition={shouldShowAsCompact}
      wrapper={(component: ReactElement) => (
        <SimpleTooltip placement="bottom" content="New Post">
          {component}
        </SimpleTooltip>
      )}
    >
      <Button
        {...buttonProps}
        variant={
          sidebar || footer ? ButtonVariant.Float : ButtonVariant.Primary
        }
        className={className}
        disabled={getIsDisabled()}
        icon={shouldShowAsCompact && <PlusIcon />}
        size={
          isLaptop || sidebar || footer ? ButtonSize.Medium : ButtonSize.Small
        }
      >
        {!shouldShowAsCompact ? 'New post' : null}
      </Button>
    </ConditionalWrapper>
  );
}
