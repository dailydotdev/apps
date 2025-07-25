import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { getIconForIntegration } from '../../lib/integrations';
import type { UserIntegration } from '../../graphql/integrations';
import { Button } from '../buttons/Button';
import { ButtonSize } from '../buttons/common';
import { IconSize } from '../Icon';
import { MenuIcon, TrashIcon, ArrowIcon } from '../icons';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { useIntegration } from '../../hooks/integrations/useIntegration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';

const UserSourceIntegrationList = dynamic(() =>
  import(
    /* webpackChunkName: "userSourceIntegrationList" */ './UserSourceIntegrationList'
  ).then((mod) => mod.UserSourceIntegrationList),
);

export type UserIntegrationItemProps = {
  integration: UserIntegration;
  isOpen: boolean;
  onToggle: () => void;
};

export const UserIntegrationItem = ({
  integration,
  isOpen,
  onToggle,
}: UserIntegrationItemProps): ReactElement => {
  const { removeIntegration } = useIntegration();
  const Icon = getIconForIntegration(integration.type);

  return (
    <>
      <div key={integration.id} className="space-between flex flex-1 gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button icon={<MenuIcon />} size={ButtonSize.Small} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuOptions
                options={[
                  {
                    icon: <TrashIcon />,
                    label: 'Revoke access',
                    action: () => {
                      removeIntegration({
                        integrationId: integration.id,
                        integrationType: integration.type,
                      });
                    },
                  },
                ]}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            icon={<ArrowIcon className={classNames(!isOpen && 'rotate-180')} />}
            size={ButtonSize.Small}
            onClick={() => {
              onToggle();
            }}
          />
        </div>
      </div>
      {isOpen && <UserSourceIntegrationList integrationId={integration.id} />}
    </>
  );
};
