import React, { ReactElement } from 'react';

import { useIntegration } from '../../hooks/integrations/useIntegration';
import { useSourceIntegrationsQuery } from '../../hooks/integrations/useSourceIntegrationsQuery';
import { useLazyModal } from '../../hooks/useLazyModal';
import { Button, ButtonIconPosition, ButtonVariant } from '../buttons/Button';
import { MiniCloseIcon } from '../icons';
import { LazyModal } from '../modals/common/types';
import { SourceAvatar } from '../profile/source';
import { ProfileImageSize } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export type UserSourceIntegrationListProps = {
  integrationId: string;
};

export const UserSourceIntegrationList = ({
  integrationId,
}: UserSourceIntegrationListProps): ReactElement => {
  const { data: sourceIntegrations, isLoading } = useSourceIntegrationsQuery({
    integrationId,
  });
  const { openModal } = useLazyModal();
  const { removeSourceIntegration } = useIntegration();

  if (!sourceIntegrations?.length && !isLoading) {
    return (
      <Typography className="px-2" type={TypographyType.Body} bold>
        No connected sources, go to your squad page to connect.
      </Typography>
    );
  }

  return (
    <ul>
      {sourceIntegrations?.map((sourceIntegration) => {
        const onClick = async (event) => {
          event.stopPropagation();

          await removeSourceIntegration({
            sourceId: sourceIntegration.source.id,
            integrationId,
            integrationType: sourceIntegration.userIntegration.type,
          });
        };

        return (
          <li
            key={`${sourceIntegration.userIntegration.id}-${sourceIntegration.source.id}`}
            className="flex w-full items-center justify-center"
          >
            <Button
              className="flex-1 pl-2 pr-3"
              variant={ButtonVariant.Tertiary}
              iconPosition={ButtonIconPosition.Right}
              icon={
                <button type="button" onClick={onClick}>
                  <MiniCloseIcon />
                </button>
              }
              onClick={() => {
                openModal({
                  type: LazyModal.SlackIntegration,
                  props: {
                    source: sourceIntegration.source,
                  },
                });
              }}
            >
              <div className="flex flex-1">
                <SourceAvatar
                  source={sourceIntegration.source}
                  size={ProfileImageSize.Small}
                />
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                >
                  <Typography
                    tag={TypographyTag.Span}
                    bold
                    color={TypographyColor.Primary}
                  >
                    {sourceIntegration.source.name}
                  </Typography>{' '}
                  <Typography
                    tag={TypographyTag.Span}
                    color={TypographyColor.Tertiary}
                  >
                    @{sourceIntegration.source.handle}
                  </Typography>
                </Typography>
              </div>
            </Button>
          </li>
        );
      })}
    </ul>
  );
};
