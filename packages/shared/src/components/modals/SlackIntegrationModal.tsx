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
import { SlackIcon } from '../icons';
import { Dropdown } from '../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { useSlack } from '../../hooks';
import { Source, SourceType } from '../../graphql/sources';
import { Connection, gqlClient } from '../../graphql/common';

export type SlackIntegrationModalProps = Omit<ModalProps, 'children'> & {
  source: Pick<Source, 'id' | 'handle' | 'type'>;
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
      const [, , { integrationId }] = queryKey;
      const result = await gqlClient.request<{
        slackChannels: SlackChannels[];
      }>(SLACK_CHANNELS_QUERY, {
        integrationId,
      });

      return result.slackChannels;
    },
    {
      enabled: !!selectedIntegration?.id,
    },
  );

  const slack = useSlack();

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium} {...props}>
      <Modal.Header title="Get source updates on Slack" />
      <Modal.Body className="flex flex-col items-center gap-4">
        {slackIntegrations?.length && (
          <>
            <p>Select slack integration</p>
            <Dropdown
              dynamicMenuWidth
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
              options={slackIntegrations?.map((item) => item.name)}
              onChange={(value, index) => {
                setSelectedIntegrationIndex(index);
              }}
              scrollable
            />
            <p>or</p>
          </>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={() => {
            slack.connect({
              redirectPath: `/${
                source.type === SourceType.Squad ? 'squads' : 'sources'
              }/${source.handle}`,
            });
          }}
          icon={<SlackIcon />}
        >
          Connect Slack
        </Button>
        {channels?.length && (
          <>
            <p>Select channel</p>
            <Dropdown
              dynamicMenuWidth
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
          </>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
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
      </Modal.Body>
    </Modal>
  );
};

export default SlackIntegrationModal;
