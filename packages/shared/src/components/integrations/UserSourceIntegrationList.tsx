import type { ReactElement } from 'react';
import React from 'react';
import { useSourceIntegrationsQuery } from '../../hooks/integrations/useSourceIntegrationsQuery';
import { ProfileImageSize } from '../ProfilePicture';
import { SourceAvatar } from '../profile/source';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../typography/Typography';
import { ButtonV2, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { MiniCloseIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useIntegration } from '../../hooks/integrations/useIntegration';

export type UserSourceIntegrationListProps = {
  integrationId: string;
};

export const UserSourceIntegrationList = ({
  integrationId,
}: UserSourceIntegrationListProps): ReactElement => {
  const { data: sourceIntegrations, isPending } = useSourceIntegrationsQuery({
    integrationId,
  });
  const { openModal } = useLazyModal();
  const { removeSourceIntegration } = useIntegration();

  if (!sourceIntegrations?.length && !isPending) {
    return (
      <Typography className="px-2" type={TypographyType.Body} bold>
        No connected sources, go to your squad page to connect.
      </Typography>
    );
  }

  return (
    <ul>
      {sourceIntegrations?.map((sourceIntegration) => {
        const onClick = async (event: React.MouseEvent) => {
          event.stopPropagation();

          await removeSourceIntegration({
            sourceId: sourceIntegration.source.id!,
            integrationId,
            integrationType: sourceIntegration.userIntegration.type,
          });
        };

        return (
          <li
            key={`${sourceIntegration.userIntegration.id}-${sourceIntegration.source.id}`}
            className="flex w-full items-center justify-center"
          >
            <ButtonV2
              className="flex-1 pl-2"
              variant={ButtonVariant.Tertiary}
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
            </ButtonV2>
            <Tooltip content="Disconnect source">
              <ButtonV2
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<MiniCloseIcon />}
                onClick={onClick}
                aria-label="Disconnect source"
              />
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
};
