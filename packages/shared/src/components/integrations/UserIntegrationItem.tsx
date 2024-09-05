import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, { ReactElement } from 'react';

import { UserIntegration } from '../../graphql/integrations';
import { ContextMenuIds } from '../../hooks/constants';
import { useIntegration } from '../../hooks/integrations/useIntegration';
import useContextMenu from '../../hooks/useContextMenu';
import { getIconForIntegration } from '../../lib/integrations';
import { Button } from '../buttons/Button';
import { ButtonSize } from '../buttons/common';
import ContextMenu from '../fields/ContextMenu';
import { IconSize } from '../Icon';
import { ArrowIcon, MenuIcon, TrashIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

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
  const contextMenuId = `${ContextMenuIds.SourceIntegrationContext}-${integration.id}`;
  const { onMenuClick: showOptionsMenu, isOpen: isOptionsOpen } =
    useContextMenu({
      id: contextMenuId,
    });
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
          <Button
            icon={<MenuIcon />}
            size={ButtonSize.Small}
            onClick={showOptionsMenu}
          />
          <ContextMenu
            id={contextMenuId}
            className="menu-primary typo-callout"
            animation="fade"
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
            isOpen={isOptionsOpen}
          />
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
