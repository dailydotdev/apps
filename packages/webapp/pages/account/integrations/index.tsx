import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { useIntegrationsQuery } from '@dailydotdev/shared/src/hooks/integrations/useIntegrationsQuery';

import { IconSize } from '@dailydotdev/shared/src/components/Icon';

import { PlusIcon, SlackIcon } from '@dailydotdev/shared/src/components/icons';
import {
  UserIntegration,
  UserIntegrationType,
} from '@dailydotdev/shared/src/graphql/integrations';
import { useSlack } from '@dailydotdev/shared/src/hooks/integrations/slack/useSlack';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { UserIntegrationItem } from '@dailydotdev/shared/src/components/integrations/UserIntegrationItem';
import { NewUserIntegration } from '@dailydotdev/shared/src/components/integrations/NewUserIntegration';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { useRouter } from 'next/router';
import { getAccountLayout } from '../../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../../components/layouts/AccountLayout/AccountPageContainer';

const AccountIntegrationsPage = (): ReactElement => {
  const [state, setState] = useState<{
    openIntegration?: UserIntegration;
  }>({});
  const slack = useSlack();
  const { logEvent } = useLogContext();
  const router = useRouter();

  const { data } = useIntegrationsQuery({
    queryOptions: {
      enabled: slack.isFeatureEnabled,
    },
  });

  const hasNoIntegrations = data && !data.length;

  const onConnectNew = useCallback(() => {
    logEvent({
      event_name: LogEvent.StartAddingWorkspace,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({
        origin: Origin.Settings,
      }),
    });

    slack.connect({
      redirectPath: `${webappUrl}account/integrations`,
    });
  }, [slack, logEvent]);

  useEffect(() => {
    if (slack.isFeatureLoading) {
      return;
    }

    if (slack.isFeatureEnabled) {
      return;
    }

    router.replace(webappUrl);
  }, [slack.isFeatureLoading, slack.isFeatureEnabled, router]);

  if (!slack.isFeatureEnabled) {
    return <AccountPageContainer title="Integrations" />;
  }

  return (
    <AccountPageContainer title="Integrations">
      <div className="flex flex-col gap-4">
        {hasNoIntegrations && (
          <NewUserIntegration
            icon={<SlackIcon size={IconSize.Large} />}
            onConnect={onConnectNew}
            preText="Slack"
            text="Get real-time updates directly in your chosen Slack channel"
          />
        )}
        {data?.map((integration) => {
          return (
            <UserIntegrationItem
              key={integration.id}
              isOpen={state.openIntegration?.id === integration.id}
              integration={integration}
              onToggle={() => {
                setState({
                  openIntegration:
                    integration.id !== state.openIntegration?.id
                      ? integration
                      : undefined,
                });
              }}
            />
          );
        })}
        {!!data?.length && (
          <NewUserIntegration
            icon={<PlusIcon size={IconSize.Large} />}
            onConnect={onConnectNew}
            preText="Add another Slack workspace"
            text="Get real-time updates directly in your chosen Slack channel"
          />
        )}
      </div>
    </AccountPageContainer>
  );
};

AccountIntegrationsPage.getLayout = getAccountLayout;

export default AccountIntegrationsPage;
