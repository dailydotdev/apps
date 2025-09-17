import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { link } from '../../../lib/links';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useActions, useSquad, useViewSize, ViewSize } from '../../../hooks';
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
import { Tooltip } from '../../tooltip/Tooltip';
import { ActionType } from '../../../graphql/actions';
import { Typography, TypographyType } from '../../typography/Typography';

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
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const completedPollType = checkHasCompleted(ActionType.SeenPostPollTooltip);
  const [shouldShowPollTooltip, setShouldShowPollTooltip] = useState(false);

  useEffect(() => {
    if (!isActionsFetched || completedPollType) {
      return;
    }

    completeAction(ActionType.SeenPostPollTooltip);
    setShouldShowPollTooltip(true);
  }, [completedPollType, isActionsFetched, completeAction]);

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

  const getTooltipContent = () => {
    if (!shouldShowPollTooltip) {
      return 'New Post';
    }

    return (
      <div className="flex flex-col gap-2 py-1">
        <Typography type={TypographyType.Subhead} center>
          You can now create polls!
        </Typography>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          className="bg-surface-invert"
          tag="a"
          href={`${link.post.create}?poll=true`}
        >
          Try it now!
        </Button>
      </div>
    );
  };

  return (
    <ConditionalWrapper
      condition={shouldShowAsCompact || shouldShowPollTooltip}
      wrapper={(component: ReactElement) => (
        <Tooltip
          side="right"
          content={getTooltipContent()}
          alwaysOpen={shouldShowPollTooltip}
        >
          {component}
        </Tooltip>
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
