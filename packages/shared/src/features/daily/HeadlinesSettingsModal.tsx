import type { ReactElement } from 'react';
import React from 'react';
import type ReactModal from 'react-modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { ModalHeader } from '../../components/modals/common/ModalHeader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { Switch } from '../../components/fields/Switch';
import { Loader } from '../../components/Loader';
import type { ChannelConfiguration } from '../../graphql/highlights';
import {
  channelConfigurationsQueryOptions,
  DAILY_HEADLINES_QUERY_KEY,
} from '../../graphql/highlights';
import type { Source } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import { useSourceActionsFollow } from '../../hooks/source/useSourceActionsFollow';
import { useSourceActionsNotify } from '../../hooks/source/useSourceActionsNotify';

interface HeadlinesSettingsModalProps
  extends Omit<ReactModal.Props, 'children'> {
  onRequestClose: () => void;
}

const ChannelRow = ({
  channel,
  source,
}: {
  channel: ChannelConfiguration;
  source: Source;
}): ReactElement => {
  const queryClient = useQueryClient();
  const { isFollowing, toggleFollow } = useSourceActionsFollow({ source });
  const { haveNotificationsOn, isReady, onNotify } = useSourceActionsNotify({
    source,
  });
  const inputId = `headline-toggle-${channel.channel}`;

  const onToggle = async () => {
    if (!isFollowing) {
      await toggleFollow();
    }
    await onNotify();

    await queryClient.invalidateQueries({
      queryKey: DAILY_HEADLINES_QUERY_KEY,
    });
  };

  return (
    <li className="flex w-full items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
        >
          {channel.displayName}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="!leading-snug"
        >
          {`A ${channel.digest?.frequency ?? 'daily'} digest of ${
            channel.displayName
          } news.`}
        </Typography>
      </div>
      <Switch
        inputId={inputId}
        name={inputId}
        checked={haveNotificationsOn}
        disabled={!isReady}
        onToggle={onToggle}
        aria-label={`${
          haveNotificationsOn ? 'Unsubscribe from' : 'Subscribe to'
        } ${channel.displayName}`}
      />
    </li>
  );
};

export const HeadlinesSettingsModal = ({
  onRequestClose,
  ...props
}: HeadlinesSettingsModalProps): ReactElement => {
  const { data, isPending } = useQuery(channelConfigurationsQueryOptions());

  const rows = (data?.channelConfigurations ?? []).flatMap((channel) => {
    const digestSource = channel.digest?.source;
    if (!digestSource) {
      return [];
    }
    const source: Source = {
      ...digestSource,
      type: SourceType.Machine,
      public: true,
    };
    return [{ channel, source }];
  });

  return (
    <Modal
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      {...props}
    >
      <ModalHeader title="Manage Headlines" />
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="w-full px-4 pb-3 pt-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Pick which topical digests show up in your Headlines section.
          </Typography>
        </div>
        {isPending ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : (
          <ul className="flex min-h-0 w-full flex-1 flex-col divide-y divide-border-subtlest-quaternary overflow-y-auto border-t border-border-subtlest-quaternary">
            {rows.map(({ channel, source }) => (
              <ChannelRow
                key={channel.channel}
                channel={channel}
                source={source}
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};
