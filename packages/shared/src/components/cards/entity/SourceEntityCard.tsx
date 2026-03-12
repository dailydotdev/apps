import React, { useRef, useState } from 'react';
import Link from '../../utilities/Link';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { SourceTooltip } from '../../../graphql/sources';
import { largeNumberFormat } from '../../../lib';
import CustomFeedOptionsMenu from '../../CustomFeedOptionsMenu';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';
import useSourceMenuProps from '../../../hooks/useSourceMenuProps';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import useShowFollowAction from '../../../hooks/useShowFollowAction';
import { FollowButton } from '../../contentPreference/FollowButton';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useSourceActionsNotify } from '../../../hooks/source/useSourceActionsNotify';
import { BellIcon } from '../../icons';

type SourceEntityCardProps = {
  source?: SourceTooltip;
  className?: {
    container?: string;
  };
};

const SourceEntityCard = ({ source, className }: SourceEntityCardProps) => {
  const { showActionBtn } = useShowFollowAction({
    entityId: source?.id,
    entityType: ContentPreferenceType.Source,
  });

  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: source?.id,
    entity: ContentPreferenceType.Source,
  });
  const [showNotificationCta, setShowNotificationCta] = useState(false);
  const prevStatusRef = useRef(contentPreference?.status);
  const menuProps = useSourceMenuProps({ source });
  const { haveNotificationsOn, onNotify } = useSourceActionsNotify({
    source,
  });

  const { description, membersCount, flags, name, image, permalink } =
    source || {};

  const currentStatus = contentPreference?.status;
  const isNowFollowing =
    currentStatus === ContentPreferenceStatus.Follow ||
    currentStatus === ContentPreferenceStatus.Subscribed;
  const wasFollowing =
    prevStatusRef.current === ContentPreferenceStatus.Follow ||
    prevStatusRef.current === ContentPreferenceStatus.Subscribed;

  if (currentStatus !== prevStatusRef.current) {
    prevStatusRef.current = currentStatus;

    if (isNowFollowing && !wasFollowing) {
      setShowNotificationCta(true);
    } else if (!isNowFollowing && wasFollowing) {
      setShowNotificationCta(false);
    }
  }

  const handleTurnOn = async () => {
    await onNotify();
    setShowNotificationCta(false);
  };

  return (
    <EntityCard
      permalink={permalink}
      image={image}
      type="source"
      className={{
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      entityName={name}
      actionButtons={
        <>
          <CustomFeedOptionsMenu
            buttonVariant={ButtonVariant.Option}
            className={{
              menu: 'z-[9999]',
              button: 'invisible group-hover/menu:visible',
            }}
            {...menuProps}
          />
          {showActionBtn && (
            <FollowButton
              entityId={source?.id}
              entityName={source?.name}
              type={ContentPreferenceType.Source}
              variant={ButtonVariant.Primary}
              status={contentPreference?.status}
              showSubscribe={false}
            />
          )}
        </>
      }
    >
      <div className="mt-3 flex w-full flex-col gap-2">
        <Link passHref href={permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {name}
          </Typography>
        </Link>
        {description && <EntityDescription copy={description} length={100} />}
        <div className="flex items-center gap-1 text-text-tertiary">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(membersCount) || 0} Followers
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(flags?.totalUpvotes) || 0} Upvotes
          </Typography>
        </div>
        {showNotificationCta && !haveNotificationsOn && (
          <div className="flex w-full items-center gap-2 rounded-8 bg-surface-float px-3 py-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="flex-1"
            >
              Get notified about new posts
            </Typography>
            <Button
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
              icon={<BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_infinite]" />}
              onClick={handleTurnOn}
            >
              Enable
            </Button>
            <style>
              {`
                @keyframes enable-notification-bell-ring {
                  0%, 100% { transform: rotate(0deg); }
                  20% { transform: rotate(-16deg); }
                  40% { transform: rotate(14deg); }
                  60% { transform: rotate(-10deg); }
                  80% { transform: rotate(8deg); }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </EntityCard>
  );
};

export default SourceEntityCard;
