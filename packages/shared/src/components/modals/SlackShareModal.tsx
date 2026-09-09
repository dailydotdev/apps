import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Dropdown } from '../fields/Dropdown';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { SlackIcon } from '../icons';
import { Loader } from '../Loader';
import Alert, { AlertType } from '../widgets/Alert';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { Post } from '../../graphql/posts';
import {
  integrationRecentChannelsQueryOptions,
  UserIntegrationType,
} from '../../graphql/integrations';
import { useSlackShare } from '../../hooks/integrations/slack/useSlackShare';
import { useSlackChannelsQuery } from '../../hooks/integrations/slack/useSlackChannelsQuery';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

export type SlackShareModalProps = Omit<ModalProps, 'children'> & {
  post: Post;
  origin?: Origin;
};

const channelLabel = (name: string) =>
  name.startsWith('#') ? name : `#${name}`;

const SlackShareModal = ({
  post,
  origin,
  ...props
}: SlackShareModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { integration, canPostAsUser, isLoading, share, isSharing, connect } =
    useSlackShare();
  const { data: recentChannels = [] } = useQuery(
    integrationRecentChannelsQueryOptions({
      integrationId: integration?.id,
      user,
    }),
  );
  const {
    channels,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingChannels,
  } = useSlackChannelsQuery({
    integrationId: integration?.id ?? '',
    queryOptions: { enabled: !!integration?.id },
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const onShare = async (
    channelId: string,
    channelSource: 'recent' | 'list',
    event: React.MouseEvent,
  ) => {
    const attribution = {
      origin,
      channel_source: channelSource,
      posted_as: canPostAsUser ? 'user' : 'app',
    };

    try {
      await share({ channelId, postId: post.id });

      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          extra: { provider: ShareProvider.Slack, ...attribution },
        }),
      );

      displayToast('Shared to Slack');
      props.onRequestClose?.(event);
    } catch (error) {
      // the bot path fails on private channels by design, so the reason matters
      // as much as the count
      logEvent(
        postLogEvent(LogEvent.ShareToSlackError, post, {
          extra: {
            ...attribution,
            error: (error as Error)?.message,
          },
        }),
      );

      displayToast('Could not share to Slack, please try again');
    }
  };

  const onReconnect = () => {
    logEvent({
      event_name: LogEvent.StartAddingWorkspace,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({ origin, reason: 'upgrade' }),
    });

    connect(window.location.pathname);
  };

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      isDrawerOnMobile
      {...props}
    >
      <ModalClose
        className="right-4 top-4"
        onClick={props.onRequestClose}
        variant={ButtonVariant.Tertiary}
      />
      {isLoading && (
        <Modal.Body className="flex items-center justify-center">
          <Loader />
        </Modal.Body>
      )}
      {!isLoading && (
        <Modal.Body className="flex flex-col gap-4">
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Title3}
            color={TypographyColor.Primary}
            bold
          >
            Share to Slack
          </Typography>
          {!!recentChannels.length && (
            <div className="flex flex-col gap-2">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Recent
              </Typography>
              <div className="flex flex-wrap gap-2">
                {recentChannels.map(({ id, name }) => (
                  <Button
                    key={id}
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    icon={<SlackIcon />}
                    disabled={isSharing}
                    onClick={(event: React.MouseEvent) =>
                      onShare(id, 'recent', event)
                    }
                  >
                    {channelLabel(name)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              All channels
            </Typography>
            <Dropdown
              placeholder={
                isLoadingChannels ? 'Loading channels' : 'Select channel'
              }
              shouldIndicateSelected
              buttonSize={ButtonSize.Medium}
              iconOnly={false}
              selectedIndex={selectedIndex}
              options={channels.map(({ name }) => channelLabel(name))}
              onChange={(_, index) => setSelectedIndex(index)}
              scrollable
              fetchNextPage={fetchNextPage}
              canFetchMore={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            disabled={selectedIndex < 0}
            loading={isSharing}
            onClick={(event: React.MouseEvent) =>
              onShare(channels[selectedIndex].id, 'list', event)
            }
          >
            Share
          </Button>
          {!canPostAsUser && (
            <Alert
              type={AlertType.Warning}
              title={
                // Alert lays its title out as a flex row, so multi-line copy
                // needs to be a shrinkable item or it renders on one line and
                // overflows the panel
                <span className="flex-1">
                  This posts as the daily.dev app.{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={onReconnect}
                  >
                    Reconnect Slack
                  </button>{' '}
                  to post under your own name.
                </span>
              }
            />
          )}
        </Modal.Body>
      )}
    </Modal>
  );
};

export default SlackShareModal;
