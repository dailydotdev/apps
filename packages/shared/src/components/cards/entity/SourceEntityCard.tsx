import React, { useEffect, useRef, useState } from 'react';
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
import { ButtonVariant } from '../../buttons/Button';
import { Separator } from '../common/common';
import EntityDescription from './EntityDescription';
import EnableNotificationsCta from './EnableNotificationsCta';
import useSourceMenuProps from '../../../hooks/useSourceMenuProps';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../../../graphql/contentPreference';
import {
  NotificationCtaPlacement,
  NotificationPromptSource,
  TargetType,
} from '../../../lib/log';
import useShowFollowAction from '../../../hooks/useShowFollowAction';
import { FollowButton } from '../../contentPreference/FollowButton';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { useSourceActionsNotify } from '../../../hooks/source/useSourceActionsNotify';
import { useNotificationCtaExperiment } from '../../../hooks/notifications/useNotificationCtaExperiment';

type SourceEntityCardProps = {
  source?: SourceTooltip;
  className?: {
    container?: string;
  };
};

const SourceEntityCard = ({ source, className }: SourceEntityCardProps) => {
  const sourceId = source?.id ?? '';
  const { showActionBtn } = useShowFollowAction({
    entityId: sourceId,
    entityType: ContentPreferenceType.Source,
  });

  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: sourceId,
    entity: ContentPreferenceType.Source,
  });
  const [showNotificationCta, setShowNotificationCta] = useState(false);
  const { isEnabled: isNotificationCtaExperimentEnabled } =
    useNotificationCtaExperiment({
      shouldEvaluate: showNotificationCta,
    });
  const { subscribe } = useContentPreference();
  const prevStatusRef = useRef(contentPreference?.status);
  const menuProps = useSourceMenuProps({ source });
  const { haveNotificationsOn, onNotify } = useSourceActionsNotify({
    source,
  });

  const currentStatus = contentPreference?.status;
  const isNowFollowing =
    currentStatus === ContentPreferenceStatus.Follow ||
    currentStatus === ContentPreferenceStatus.Subscribed;
  const wasFollowing =
    prevStatusRef.current === ContentPreferenceStatus.Follow ||
    prevStatusRef.current === ContentPreferenceStatus.Subscribed;
  const shouldRenderNotificationCta =
    isNotificationCtaExperimentEnabled &&
    showNotificationCta &&
    !haveNotificationsOn;

  useEffect(() => {
    if (currentStatus === prevStatusRef.current) {
      return;
    }

    prevStatusRef.current = currentStatus;

    if (isNowFollowing && !wasFollowing) {
      setShowNotificationCta(true);
      return;
    }

    if (!isNowFollowing && wasFollowing) {
      setShowNotificationCta(false);
    }
  }, [currentStatus, isNowFollowing, wasFollowing]);

  if (!source?.id || !source.name || !source.image || !source.permalink) {
    return null;
  }

  const handleTurnOn = async () => {
    if (!source?.id) {
      throw new Error('Cannot subscribe to notifications without source id');
    }

    if (currentStatus !== ContentPreferenceStatus.Subscribed) {
      await subscribe({
        id: source.id,
        entity: ContentPreferenceType.Source,
        entityName: source.name ?? source.id,
      });
    }

    await onNotify();
    setShowNotificationCta(false);
  };

  return (
    <EntityCard
      permalink={source.permalink}
      image={source.image}
      type="source"
      className={{
        container: className?.container,
        image: 'size-10 rounded-full',
      }}
      entityName={source.name}
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
              entityId={source.id}
              entityName={source.name}
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
        <Link passHref href={source.permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {source.name}
          </Typography>
        </Link>
        {source.description && (
          <EntityDescription copy={source.description} length={100} />
        )}
        <div className="flex items-center gap-1 text-text-tertiary">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(source.membersCount ?? 0)} Followers
          </Typography>
          <Separator />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {largeNumberFormat(source.flags?.totalUpvotes ?? 0)} Upvotes
          </Typography>
        </div>
        {shouldRenderNotificationCta && (
          <EnableNotificationsCta
            onEnable={handleTurnOn}
            analytics={{
              placement: NotificationCtaPlacement.SourceCard,
              targetType: TargetType.Source,
              targetId: source.id,
              source: NotificationPromptSource.SourceSubscribe,
            }}
          />
        )}
      </div>
    </EntityCard>
  );
};

export default SourceEntityCard;
