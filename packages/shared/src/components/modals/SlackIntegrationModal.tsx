import React, { ReactElement, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, ModalProps } from './common/Modal';
import { RequestKey, generateQueryKey } from '../../lib/query';
import { SLACK_CHANNELS_QUERY, SlackChannels } from '../../graphql/slack';
import user from '../../../__tests__/fixture/loggedUser';
import {
  USER_INTEGRATIONS,
  UserIntegration,
  UserIntegrationType,
} from '../../graphql/users';
import { Dropdown } from '../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { useSlack } from '../../hooks';
import { Source } from '../../graphql/sources';
import { Connection, gqlClient } from '../../graphql/common';
import { ModalClose } from './common/ModalClose';
import { SourceAvatar } from '../profile/source';
import { ProfileImageSize } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { SlackIcon } from '../icons';

export type SlackIntegrationModalProps = Omit<ModalProps, 'children'> & {
  source: Pick<Source, 'id' | 'handle' | 'type' | 'image' | 'name'>;
};

const SlackIntegrationModal = ({
  source,
  ...props
}: SlackIntegrationModalProps): ReactElement => {
  const { data: slackIntegrations } = useQuery(
    generateQueryKey(RequestKey.UserIntegrations, user),
    async () => {
      const result = await gqlClient.request<{
        userIntegrations: Connection<UserIntegration>;
      }>(USER_INTEGRATIONS);

      return result.userIntegrations;
    },
    {
      select: useCallback((data) => {
        return data?.edges
          ?.map((item) => item.node)
          .filter(
            (integration) => integration.type === UserIntegrationType.Slack,
          );
      }, []),
    },
  );

  const [selectedIntegrationIndex, setSelectedIntegrationIndex] = useState(0);
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);

  const selectedIntegration = slackIntegrations?.[selectedIntegrationIndex];

  const { data: channels } = useQuery(
    generateQueryKey(RequestKey.SlackChannels, user, {
      integrationId: selectedIntegration?.id,
    }),
    async ({ queryKey }) => {
      const [, , { integrationId }] = queryKey as [
        unknown,
        unknown,
        { integrationId: string },
      ];
      const result = await gqlClient.request<{
        slackChannels: {
          data: SlackChannels[];
        };
      }>(SLACK_CHANNELS_QUERY, {
        integrationId,
      });

      return result.slackChannels.data;
    },
    {
      enabled: !!selectedIntegration?.id,
    },
  );

  const slack = useSlack();

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.XSmall} {...props}>
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
            shouldIndicateSelected
            buttonSize={ButtonSize.Medium}
            iconOnly={false}
            key="feed"
            selectedIndex={selectedIntegrationIndex}
            renderItem={(_, index) => (
              <span className="typo-callout">
                {slackIntegrations[index].name}
              </span>
            )}
            icon={<SlackIcon />}
            options={slackIntegrations?.map((item) => item.name)}
            onChange={(value, index) => {
              setSelectedIntegrationIndex(index);
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
              shouldIndicateSelected
              buttonSize={ButtonSize.Medium}
              iconOnly={false}
              key="feed"
              selectedIndex={selectedChannelIndex}
              renderItem={(_, index) => (
                <span className="typo-callout">{`#${channels[index].name}`}</span>
              )}
              options={channels?.map((item) => item.name)}
              onChange={(value, index) => {
                setSelectedChannelIndex(index);
              }}
              scrollable
            />
          )}
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={() => {
            slack.connectSource({
              channelId: channels[selectedChannelIndex].id,
              integrationId: selectedIntegration.id,
              sourceId: source.id,
            });
          }}
        >
          Save
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={() => {
            slack.connectSource({
              channelId: channels[selectedChannelIndex].id,
              integrationId: selectedIntegration.id,
              sourceId: source.id,
            });
          }}
        >
          Remove integration
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default SlackIntegrationModal;
