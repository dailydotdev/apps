import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { SlackIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useSourceIntegrationQuery } from '../../../../hooks/integrations/useSourceIntegrationQuery';
import { UserIntegrationType } from '../../../../graphql/integrations';
import { useSquadPageContext } from '../../SquadPageContext';
import { SquadManageSection } from '../../lib/routes';
import { SquadManageSectionPanel } from './SquadManageLayout';

export const SquadManageIntegrations = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { openModal } = useLazyModal();
  const { data: integration, isPending } = useSourceIntegrationQuery({
    sourceId: squad.id,
    userIntegrationType: UserIntegrationType.Slack,
  });

  return (
    <SquadManageSectionPanel section={SquadManageSection.Integrations}>
      <div className="flex flex-col gap-4 px-4 py-6 tablet:px-6">
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.Body} bold>
            Connected apps
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Send the Squad&apos;s new posts to the tools your team already uses.
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float">
            <SlackIcon size={IconSize.Small} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Typography type={TypographyType.Callout} bold>
              Slack
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {integration
                ? 'Connected. New posts are sent to your Slack channel.'
                : 'Post every new post to a Slack channel.'}
            </Typography>
          </div>
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            disabled={isPending && !integration}
            onClick={() =>
              openModal({
                type: LazyModal.SlackIntegration,
                props: { source: squad, trackStart: true },
              })
            }
          >
            {integration ? 'Manage' : 'Connect'}
          </Button>
        </div>
      </div>
    </SquadManageSectionPanel>
  );
};
