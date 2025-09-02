import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../components/buttons/Button';
import ConditionalWrapper from '../../components/ConditionalWrapper';
import { MiniCloseIcon, SettingsIcon, VIcon } from '../../components/icons';
import { LazyModal, ModalSize } from '../../components/modals/common/types';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../components/typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCampaignById } from '../../graphql/campaigns';
import type { Squad } from '../../graphql/sources';
import { SourcePermissions } from '../../graphql/sources';
import { useLazyModal } from '../../hooks/useLazyModal';
import { webappUrl } from '../../lib/constants';
import { BoostButton } from './BoostButton';
import { IconSize } from '../../components/Icon';
import { Tooltip } from '../../components/tooltip/Tooltip';

const Requirement = ({ copy, passed }: { copy: string; passed: boolean }) => {
  const Icon = passed ? VIcon : MiniCloseIcon;

  return (
    <Typography
      type={TypographyType.Body}
      tag={TypographyTag.Span}
      className="flex w-full flex-row items-center justify-between"
    >
      {copy}
      <Icon
        size={IconSize.XSmall}
        className={
          passed ? 'text-action-upvote-default' : 'text-action-downvote-default'
        }
      />
    </Typography>
  );
};

export function BoostSourceButton({
  squad,
  buttonProps = {},
}: {
  squad: Squad;
  buttonProps?: ButtonProps<'button'>;
}): ReactElement {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const campaignId = squad?.flags?.campaignId;
  const { data: campaign, isFetched } = useCampaignById(campaignId);
  const isBooster = user && user?.id === campaign?.user.id;
  const permissions = squad?.currentMember?.permissions;
  const permittedUser = permissions?.includes(SourcePermissions.BoostSquad);

  const onBoost = () =>
    openModal({ type: LazyModal.BoostSquad, props: { squad } });

  const onViewBoost = () =>
    openModal({ type: LazyModal.BoostedCampaignView, props: { campaign } });

  const onClick = () => {
    if (!permittedUser) {
      return null;
    }

    if (campaignId) {
      if (!isBooster) {
        return null;
      }

      return onViewBoost();
    }

    if (!squad?.image || !squad?.headerImage || !squad?.description) {
      // open modal
      openModal({
        type: LazyModal.ActionSuccess,
        props: {
          size: ModalSize.XSmall,
          content: {
            title: 'Make your Squad boost-ready',
            description: `Before we can launch your boost, your squad needs a few details. This isn't just red tape, we want your Squad to look its best and get the traction it deserves.`,
            body: (
              <div className="mt-2 flex flex-col gap-2">
                <Requirement copy="Profile image" passed={!!squad?.image} />
                <Requirement copy="Cover image" passed={!!squad?.headerImage} />
                <Requirement
                  copy="Squad description"
                  passed={!!squad?.description}
                />
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                  className="mt-2"
                >
                  Finish these in Squad settings to unlock boosting and make a
                  strong impression.
                </Typography>
              </div>
            ),
          },
          cta: {
            copy: 'Go to Squad settings',
            icon: <SettingsIcon secondary />,
            tag: 'a',
            href: `${webappUrl}squads/${squad.handle}/edit`,
          },
        },
      });
      return null;
    }

    return onBoost();
  };

  const hasTooltip = campaignId && !isBooster && !!campaign;

  if (!permittedUser) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={hasTooltip}
      wrapper={(component) => (
        <Tooltip
          className="max-w-64"
          content={`The Squad is currently being boosted by ${
            campaign.user.name
          }. You can start a new boost once this one ends on ${campaign.endedAt.toLocaleString()}`}
        >
          <div>{component}</div>
        </Tooltip>
      )}
    >
      <BoostButton
        campaignId={campaignId}
        buttonProps={{
          ...buttonProps,
          onClick,
          disabled: hasTooltip,
          loading: campaignId && !isFetched,
        }}
      />
    </ConditionalWrapper>
  );
}
