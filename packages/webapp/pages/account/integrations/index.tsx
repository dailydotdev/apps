import React, { ReactElement, useState } from 'react';

import { useIntegrationsQuery } from '@dailydotdev/shared/src/hooks/integrations/useIntegrationsQuery';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, SlackIcon } from '@dailydotdev/shared/src/components/icons';
import { UserIntegration } from '@dailydotdev/shared/src/graphql/integrations';
import { useSlack } from '@dailydotdev/shared/src/hooks/integrations/slack/useSlack';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { UserIntegrationItem } from '@dailydotdev/shared/src/components/integrations/UserIntegrationItem';
import { getAccountLayout } from '../../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../../components/layouts/AccountLayout/AccountPageContainer';

const AccountIntegrationsPage = (): ReactElement => {
  const [state, setState] = useState<{
    openIntegration?: UserIntegration;
  }>({});
  const slack = useSlack();

  const { data } = useIntegrationsQuery();

  const hasNoIntegrations = data && !data.length;

  return (
    <AccountPageContainer title="Integrations">
      <div className="flex flex-col gap-4">
        {hasNoIntegrations && (
          <div className="flex items-center gap-2 px-1">
            <SlackIcon size={IconSize.Large} />
            <div className="flex flex-1 flex-col">
              <Typography
                type={TypographyType.Body}
                bold
                color={TypographyColor.Primary}
              >
                Slack
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                Get real-time updates directly in your chosen Slack channel
              </Typography>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                onClick={() => {
                  slack.connect({
                    redirectPath: `${webappUrl}account/integrations`,
                  });
                }}
              >
                Connect
              </Button>
            </div>
          </div>
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
          <div className="flex items-center gap-2 px-1">
            <PlusIcon size={IconSize.Large} />
            <div className="flex flex-1 flex-col">
              <Typography
                type={TypographyType.Body}
                bold
                color={TypographyColor.Primary}
              >
                Add another Slack workspace
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                Get real-time updates directly in your chosen Slack channel
              </Typography>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={ButtonVariant.Secondary}
                size={ButtonSize.Small}
                onClick={() => {
                  slack.connect({
                    redirectPath: `${webappUrl}account/integrations`,
                  });
                }}
              >
                Connect
              </Button>
            </div>
          </div>
        )}
      </div>
    </AccountPageContainer>
  );
};

AccountIntegrationsPage.getLayout = getAccountLayout;

export default AccountIntegrationsPage;
