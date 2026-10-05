import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import Autocomplete from '../fields/Autocomplete';
import Textarea from '../fields/Textarea';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Loader } from '../Loader';
import Alert, { AlertType } from '../widgets/Alert';
import { SlackIcon } from '../icons/Slack';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  integrationRecentChannelsQueryOptions,
  isIntegrationMissingScopeError,
  slackShareMessageMaxLength,
} from '../../graphql/integrations';
import { useSlackShare } from '../../hooks/integrations/slack/useSlackShare';
import type { SlackShareSnapshot } from '../../hooks/integrations/slack/slackShareSnapshot';
import type { SlackConnectReason } from '../../hooks/integrations/slack/useSlackShareButton';
import { useSlackConnect } from '../../hooks/integrations/slack/useSlackShareButton';
import { useSlackChannelsQuery } from '../../hooks/integrations/slack/useSlackChannelsQuery';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import type { ShareablePost } from '../../lib/feed';
import { postLogEvent } from '../../lib/feed';
import { isExtension } from '../../lib/func';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { toPngFile } from '../../lib/imageShare/shareImageFile';

export type SlackShareModalProps = Omit<ModalProps, 'children'> & {
  post: ShareablePost;
  origin?: Origin;
  placement?: Origin;
  /** Shown above the channel picker with an optional message. */
  snapshot?: SlackShareSnapshot;
  /** Logged beside the share's own fields, like a highlight's id. */
  extra?: Record<string, unknown>;
};

const channelLabel = (name: string) =>
  name.startsWith('#') ? name : `#${name}`;

const maxVisibleChannels = 20;

const SlackShareModal = ({
  post,
  origin,
  placement,
  snapshot,
  extra,
  ...props
}: SlackShareModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const {
    integration,
    canPostAsUser,
    canShareImages,
    isLoading,
    share,
    isSharing,
  } = useSlackShare();
  const connectSlack = useSlackConnect({ post, origin, placement });
  const { data: recentChannels = [] } = useQuery(
    integrationRecentChannelsQueryOptions({
      integrationId: integration?.id,
      user,
    }),
  );
  const { channels, isFetchingAll } = useSlackChannelsQuery({
    integrationId: integration?.id ?? '',
    queryOptions: { enabled: !!integration?.id },
    fetchAll: true,
  });
  const [channelQuery, setChannelQuery] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState(
    snapshot?.channel?.id,
  );
  const [message, setMessage] = useState(snapshot?.message ?? '');
  const preview = useObjectUrl(snapshot?.image);
  const [isMissingScope, setIsMissingScope] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectRef = useRef<HTMLButtonElement>(null);
  const needsImagePermission =
    !!snapshot && (!canShareImages || isMissingScope);

  useEffect(() => {
    if (isMissingScope) {
      reconnectRef.current?.focus();
    }
  }, [isMissingScope]);

  const channelOptions = useMemo(() => {
    const query = channelQuery.trim().toLowerCase().replace(/^#/, '');
    const matches = query
      ? channels.filter(({ name }) => name.toLowerCase().includes(query))
      : channels;

    // the popover renders one button per option, and a large workspace has
    // thousands; the search is how you reach the rest
    return matches.slice(0, maxVisibleChannels).map(({ id, name }) => ({
      value: id,
      label: channelLabel(name),
    }));
  }, [channels, channelQuery]);

  const onShare = async (
    channelId: string,
    channelSource: 'recent' | 'list',
    event: React.MouseEvent,
  ) => {
    const attribution = {
      origin,
      placement,
      channel_source: channelSource,
      posted_as: canPostAsUser ? 'user' : 'app',
      ...(snapshot && {
        content: 'snapshot',
        has_message: !!message.trim(),
      }),
      ...extra,
    };

    try {
      await share({
        channelId,
        postId: post.id,
        ...(snapshot && {
          image: toPngFile(snapshot.image, snapshot.filename),
          message,
        }),
      });

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

      if (snapshot && isIntegrationMissingScopeError(error)) {
        setSelectedChannelId(channelId);
        setIsMissingScope(true);

        return;
      }

      displayToast('Could not share to Slack, please try again');
    }
  };

  const onReconnect = (reason: SlackConnectReason) => {
    if (!snapshot) {
      connectSlack({ reason });

      return;
    }

    const known = [...channels, ...recentChannels];

    if (snapshot.channel) {
      known.push(snapshot.channel);
    }

    setIsReconnecting(true);
    connectSlack({
      reason,
      snapshot: {
        ...snapshot,
        message,
        channel: known.find(({ id }) => id === selectedChannelId),
      },
    });
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
          {snapshot && (
            <>
              <Textarea
                inputId="slack-share-message"
                name="slack-share-message"
                fieldType="secondary"
                label="Message"
                placeholder="Add a message (optional)"
                rows={2}
                maxLength={slackShareMessageMaxLength}
                showMaxLength={false}
                value={message}
                valueChanged={setMessage}
              />
              {preview && (
                <img
                  alt="Snapshot preview"
                  className="max-h-40 w-full rounded-12 border border-border-subtlest-tertiary bg-surface-float object-contain"
                  src={preview}
                />
              )}
            </>
          )}
          {needsImagePermission && (
            <div
              className="flex flex-col gap-3 rounded-14 bg-surface-float p-3"
              role="status"
            >
              <div className="flex flex-col gap-0.5">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                  bold
                >
                  Allow daily.dev to send images
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Slack needs an updated permission before it accepts the
                  snapshot.{' '}
                  {isExtension
                    ? 'Reconnect, then take the snapshot again to send it.'
                    : 'Reconnect once and you will be right back here.'}
                </Typography>
              </div>
              <Button
                ref={reconnectRef}
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                icon={<SlackIcon secondary />}
                loading={isReconnecting}
                onClick={() => onReconnect('image_permission')}
              >
                Reconnect Slack
              </Button>
            </div>
          )}
          {!needsImagePermission && !!recentChannels.length && (
            <div className="flex flex-col gap-1">
              {/* matches the label the channel field renders below it */}
              <Typography
                className="px-2"
                type={TypographyType.Caption1}
                color={TypographyColor.Primary}
                bold
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
          {!needsImagePermission && (
            <>
              <Autocomplete
                name="slack-channel"
                // secondary keeps Autocomplete from rendering a second heading
                // of its own above the one the field already draws
                fieldType="secondary"
                label="All channels"
                placeholder={
                  isFetchingAll ? 'Loading channels' : 'Select a channel'
                }
                defaultValue={
                  snapshot?.channel && channelLabel(snapshot.channel.name)
                }
                options={channelOptions}
                isLoading={isFetchingAll}
                selectedValue={selectedChannelId}
                onChange={setChannelQuery}
                onSelect={setSelectedChannelId}
              />
              <Button
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Large}
                disabled={!selectedChannelId}
                loading={isSharing}
                onClick={(event: React.MouseEvent) => {
                  if (selectedChannelId) {
                    onShare(selectedChannelId, 'list', event);
                  }
                }}
              >
                Share
              </Button>
              {!canPostAsUser && (
                <Alert
                  type={AlertType.Warning}
                  title={
                    // Alert lays its title out as a flex row, so multi-line
                    // copy needs to be a shrinkable item or it renders on one
                    // line and overflows the panel
                    <span className="flex-1">
                      This posts as the daily.dev app.{' '}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => onReconnect('upgrade')}
                      >
                        Reconnect Slack
                      </button>{' '}
                      to post under your own name.
                    </span>
                  }
                />
              )}
            </>
          )}
        </Modal.Body>
      )}
    </Modal>
  );
};

export default SlackShareModal;
