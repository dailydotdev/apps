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
  ButtonV2Props,
} from '../../buttons/ButtonV2';
import { ButtonV2, ButtonSize, ButtonVariant } from '../../buttons/ButtonV2';
import { PlusIcon } from '../../icons';
import ConditionalWrapper from '../../ConditionalWrapper';
import { Tooltip } from '../../tooltip/Tooltip';
import { ActionType } from '../../../graphql/actions';
import { Typography, TypographyType } from '../../typography/Typography';
import Link from '../../utilities/Link';

interface CreatePostButtonProps<Tag extends AllowedTags>
  extends Pick<ButtonV2Props<Tag>, 'className' | 'onClick' | 'size'> {
  compact?: boolean;
  showIcon?: boolean;
  sidebar?: boolean;
  footer?: boolean;
}

const SHOW_POLL_TOOLTIP_ACCOUNTS_BEFORE = new Date(2025, 8, 22);

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
  const isTablet = useViewSize(ViewSize.Tablet);
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
  const shouldShowPollCondition =
    isActionsFetched &&
    !completedPollType &&
    isTablet &&
    user?.createdAt &&
    new Date(user.createdAt) < SHOW_POLL_TOOLTIP_ACCOUNTS_BEFORE;

  useEffect(() => {
    if (!shouldShowPollCondition) {
      return;
    }

    completeAction(ActionType.SeenPostPollTooltip);
    setShouldShowPollTooltip(true);
  }, [shouldShowPollCondition, completeAction]);

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
    onClick?: (e: React.MouseEvent<AllowedElements, MouseEvent>) => void;
  } = onClick ? { onClick } : { tag: 'a' };

  const shouldUseLink = !onClick;

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
        <Link href={`${link.post.create}?poll=true`} passHref prefetch={false}>
          <ButtonV2
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            className="border-surface-invert bg-surface-invert"
            tag="a"
          >
            Try it now!
          </ButtonV2>
        </Link>
      </div>
    );
  };

  const button = (
    <ButtonV2
      {...buttonProps}
      variant={sidebar || footer ? ButtonVariant.Float : ButtonVariant.Primary}
      className={className}
      disabled={getIsDisabled()}
      icon={(shouldShowAsCompact || showIcon) && <PlusIcon />}
      size={
        isLaptop || sidebar || footer ? ButtonSize.Medium : ButtonSize.Small
      }
      {...attrs}
    >
      {!shouldShowAsCompact ? 'New post' : null}
    </ButtonV2>
  );

  return (
    <ConditionalWrapper
      condition={shouldShowAsCompact || shouldShowPollTooltip}
      wrapper={(component: ReactElement) => (
        <Tooltip
          side="right"
          content={getTooltipContent()}
          open={shouldShowPollTooltip ? true : undefined}
        >
          {component}
        </Tooltip>
      )}
    >
      <ConditionalWrapper
        condition={shouldUseLink}
        wrapper={(component: ReactElement) => (
          <Link href={href} passHref prefetch={false}>
            {component}
          </Link>
        )}
      >
        {button}
      </ConditionalWrapper>
    </ConditionalWrapper>
  );
}
