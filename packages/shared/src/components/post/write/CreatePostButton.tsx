import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSquad, useViewSize, ViewSize } from '../../../hooks';
import { verifyPermission } from '../../../graphql/squads';
import { SourcePermissions } from '../../../graphql/sources';
import type {
  AllowedElements,
  AllowedTags,
  ButtonProps,
} from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import ConditionalWrapper from '../../ConditionalWrapper';
import { SimpleTooltip } from '../../tooltips';

interface CreatePostButtonProps<Tag extends AllowedTags>
  extends Pick<ButtonProps<Tag>, 'className' | 'onClick' | 'size'> {
  compact?: boolean;
  showIcon?: boolean;
  sidebar?: boolean;
  footer?: boolean;
}

export function CreatePostButton<Tag extends AllowedTags>({
  className,
  compact,
  sidebar,
  footer,
  onClick,
  showIcon,
  ...attrs
}: CreatePostButtonProps<Tag>): ReactElement {
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
    onClick?: (e: React.MouseEvent<AllowedElements, MouseEvent>) => void;
  } = onClick ? { onClick } : { tag: 'a', href };

  const shouldShowAsCompact =
    compact !== false && ((isLaptop && !isLaptopL) || compact);

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
        icon={(shouldShowAsCompact || showIcon) && <PlusIcon />}
        size={
          isLaptop || sidebar || footer ? ButtonSize.Medium : ButtonSize.Small
        }
        {...attrs}
      >
        {!shouldShowAsCompact ? 'New post' : null}
      </Button>
    </ConditionalWrapper>
  );
}
