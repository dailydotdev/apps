import React, { ReactElement, useState } from 'react';

import { useIntegrations } from '@dailydotdev/shared/src/hooks/integrations/useIntegrations';
import { useIntegration } from '@dailydotdev/shared/src/hooks/integrations/useIntegration';
import { getIconForIntegration } from '@dailydotdev/shared/src/lib/integrations';
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
import {
  ArrowIcon,
  MenuIcon,
  PlusIcon,
  SlackIcon,
  TrashIcon,
} from '@dailydotdev/shared/src/components/icons';
import { UserIntegration } from '@dailydotdev/shared/src/graphql/integrations';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useSlack } from '@dailydotdev/shared/src/hooks/integrations/slack/useSlack';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import useContextMenu from '@dailydotdev/shared/src/hooks/useContextMenu';
import { ContextMenuIds } from '@dailydotdev/shared/src/hooks/constants';
import ContextMenu from '@dailydotdev/shared/src/components/fields/ContextMenu';
import { getAccountLayout } from '../../../components/layouts/AccountLayout';
import { AccountPageContainer } from '../../../components/layouts/AccountLayout/AccountPageContainer';

const UserSourceIntegrationList = dynamic(() =>
  import(
    /* webpackChunkName: "userSourceIntegrationList" */ '@dailydotdev/shared/src/components/integrations/UserSourceIntegrationList'
  ).then((mod) => mod.UserSourceIntegrationList),
);

const AccountIntegrationsPage = (): ReactElement => {
  const [state, setState] = useState<{
    openIntegration?: UserIntegration;
  }>({});
  const slack = useSlack();
  const { onMenuClick: showOptionsMenu, isOpen: isOptionsOpen } =
    useContextMenu({
      id: ContextMenuIds.SourceIntegrationContext,
    });
  const { removeIntegration } = useIntegration();

  const { data } = useIntegrations();

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
          const Icon = getIconForIntegration(integration.type);

          return (
            <>
              <div
                key={integration.id}
                className="space-between flex flex-1 gap-2"
              >
                <div className="flex items-center gap-2 px-1">
                  <Icon size={IconSize.Large} />
                  <Typography
                    type={TypographyType.Body}
                    bold
                    color={TypographyColor.Primary}
                  >
                    {integration.name}
                  </Typography>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    icon={<MenuIcon />}
                    size={ButtonSize.Small}
                    onClick={showOptionsMenu}
                  />
                  <ContextMenu
                    id={ContextMenuIds.SourceIntegrationContext}
                    className="menu-primary typo-callout"
                    animation="fade"
                    options={[
                      {
                        icon: <TrashIcon />,
                        label: 'Revoke access',
                        action: () => {
                          removeIntegration({
                            integrationId: integration.id,
                          });
                        },
                      },
                    ]}
                    isOpen={isOptionsOpen}
                  />
                  <Button
                    icon={
                      <ArrowIcon
                        className={classNames(
                          state.openIntegration?.id !== integration.id &&
                            'rotate-180',
                        )}
                      />
                    }
                    size={ButtonSize.Small}
                    onClick={() => {
                      setState({
                        openIntegration:
                          integration.id !== state.openIntegration?.id
                            ? integration
                            : undefined,
                      });
                    }}
                  />
                </div>
              </div>
              {state.openIntegration?.id === integration.id && (
                <UserSourceIntegrationList integrationId={integration.id} />
              )}
            </>
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
