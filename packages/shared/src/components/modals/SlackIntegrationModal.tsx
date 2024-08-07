import React, { ReactElement, useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, ModalProps } from './common/Modal';
import {
  UserIntegration,
  UserIntegrationType,
} from '../../graphql/integrations';
import { Dropdown } from '../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { useToastNotification, useViewSize, ViewSize } from '../../hooks';
import { Source, SourceType } from '../../graphql/sources';
import { ModalClose } from './common/ModalClose';
import { SourceAvatar } from '../profile/source';
import { ProfileImageSize } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { PlusIcon, SlackIcon } from '../icons';
import { useSlack } from '../../hooks/integrations/slack/useSlack';
import { useIntegrations } from '../../hooks/integrations/useIntegrations';
import { useSourceIntegration } from '../../hooks/integrations/useSourceIntegration';
import { useSlackChannels } from '../../hooks/integrations/slack/useSlackChannels';
import { useIntegration } from '../../hooks/integrations/useIntegration';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { labels } from '../../lib';
import { Image } from '../image/Image';
import { useThemedAsset } from '../../hooks/utils';
import { slackIntegration } from '../../lib/constants';
import { LazyModal } from './common/types';

export type SlackIntegrationModalProps = Omit<ModalProps, 'children'> & {
  source: Pick<Source, 'id' | 'handle' | 'type' | 'image' | 'name'>;
};

const SlackIntegrationModal = ({
  source,
  ...props
}: SlackIntegrationModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { removeSourceIntegration } = useIntegration();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const [state, setState] = useState<{
    userIntegration?: UserIntegration;
    channelId?: string;
  }>({});

  const { data: sourceIntegration } = useSourceIntegration({
    userIntegrationType: UserIntegrationType.Slack,
    sourceId: source.id,
  });

  const { data: slackIntegrations, isLoading: isLoadingIntegrations } =
    useIntegrations({
      queryOptions: {
        select: useCallback((data) => {
          const filteredData = data.filter(
            (integration) => integration.type === UserIntegrationType.Slack,
          );

          filteredData.push({
            id: 'new',
            type: UserIntegrationType.Slack,
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'Connect another workspace',
            userId: 'new',
          });

          return filteredData;
        }, []),
      },
    });

  const selectedIntegration =
    state.userIntegration ||
    sourceIntegration?.userIntegration ||
    slackIntegrations?.[0];
  const selectedIntegrationIndex = slackIntegrations?.findIndex(
    (item) => item.id === selectedIntegration?.id,
  );

  const { data: channels } = useSlackChannels({
    integrationId: selectedIntegration?.id,
  });

  const selectedChannel = state.channelId || sourceIntegration?.channelIds[0];
  const selectedChannelIndex = channels?.findIndex(
    (item) => item.id === selectedChannel,
  );

  const slack = useSlack();

  const onConnectNew = () => {
    slack.connect({
      redirectPath: `/${
        source.type === SourceType.Squad ? 'squads' : 'sources'
      }/${source.handle}?lzym=${LazyModal.SlackIntegration}`,
    });
  };

  const { mutateAsync: onSave, isLoading: isSaving } = useMutation(
    async () => {
      await slack.connectSource({
        channelId: channels[selectedChannelIndex].id,
        integrationId: selectedIntegration.id,
        sourceId: source.id,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          generateQueryKey(RequestKey.UserSourceIntegrations, user),
        );

        displayToast(labels.integrations.success.integrationSaved);
      },
    },
  );

  const noIntegrations = !slackIntegrations?.length && !isLoadingIntegrations;

  const { slackIntegrationHeader } = useThemedAsset();

  const modalProps: ModalProps = {
    kind: Modal.Kind.FlexibleCenter,
    size: Modal.Size.XSmall,
    isDrawerOnMobile: true,
    ...props,
  };

  if (noIntegrations) {
    return (
      <Modal {...modalProps}>
        <ModalClose
          className="top-4"
          onClick={props.onRequestClose}
          variant={ButtonVariant.Primary}
        />
        <Modal.Body className="flex flex-col items-center justify-center gap-4 text-center">
          <Image src={slackIntegrationHeader} alt="Slack integration" />
          <Typography
            type={TypographyType.Title1}
            bold
            color={TypographyColor.Primary}
          >
            Squad + Slack = 🔥
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Get instant updates in Slack and keep the conversation going!
          </Typography>
          <Button
            className="w-full"
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            onClick={onConnectNew}
          >
            Connect to Slack
          </Button>
          <Button
            className="w-full"
            tag="a"
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            href={slackIntegration}
            target="_blank"
          >
            Read more ➔
          </Button>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal {...modalProps}>
      <ModalClose className="top-4" onClick={props.onRequestClose} />
      <Modal.Body className="flex flex-col gap-4">
        <div className="mr-auto flex items-center justify-center">
          <SourceAvatar source={source} size={ProfileImageSize.Small} />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            <Typography
              tag={TypographyTag.Span}
              bold
              color={TypographyColor.Primary}
            >
              {source.name}
            </Typography>{' '}
            <Typography
              tag={TypographyTag.Span}
              color={TypographyColor.Tertiary}
            >
              @{source.handle}
            </Typography>
          </Typography>
        </div>
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Configure Integration
        </Typography>
        {!!slackIntegrations?.length && (
          <Dropdown
            placeholder="Select workspace"
            shouldIndicateSelected
            buttonSize={ButtonSize.Medium}
            iconOnly={false}
            key="feed"
            selectedIndex={selectedIntegrationIndex}
            renderItem={(value, index) => {
              const currentIntegration = slackIntegrations[index];
              const ItemIcon =
                currentIntegration.id === 'new' ? PlusIcon : SlackIcon;

              return (
                <span className="flex gap-2 typo-callout">
                  <ItemIcon />
                  {slackIntegrations[index].name}
                </span>
              );
            }}
            icon={<SlackIcon />}
            options={slackIntegrations?.map((item) => item.name)}
            onChange={(value, index) => {
              const currentIntegration = slackIntegrations[index];

              if (currentIntegration.id === 'new') {
                onConnectNew();

                return;
              }

              setState((current) => {
                return {
                  ...current,
                  userIntegration: slackIntegrations[index],
                  channelId: undefined,
                };
              });
            }}
            scrollable
          />
        )}
        <div>
          <Typography
            className="mb-2 flex items-center"
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Select channels
            {!!channels?.length && (
              <Typography
                className="ml-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-surface-float p-0.5"
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                bold={false}
              >
                {channels.length}
              </Typography>
            )}
          </Typography>
          {!!channels?.length && (
            <Dropdown
              placeholder="Select channel"
              shouldIndicateSelected
              buttonSize={ButtonSize.Medium}
              iconOnly={false}
              key="feed"
              selectedIndex={selectedChannelIndex}
              renderItem={(_, index) => (
                <span className="typo-callout">{`#${channels[index].name}`}</span>
              )}
              options={channels?.map((item) => `#${item.name}`)}
              onChange={(value, index) => {
                setState((current) => {
                  return {
                    ...current,
                    channelId: channels[index].id,
                  };
                });
              }}
              scrollable
            />
          )}
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={async (event) => {
            await onSave();

            props.onRequestClose?.(event);
          }}
          loading={isSaving}
        >
          Save
        </Button>
        <Button
          type="button"
          variant={isMobile ? ButtonVariant.Float : ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={async (event) => {
            await removeSourceIntegration({
              integrationId: selectedIntegration.id,
              sourceId: source.id,
            });

            props.onRequestClose?.(event);
          }}
        >
          Remove integration
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default SlackIntegrationModal;
