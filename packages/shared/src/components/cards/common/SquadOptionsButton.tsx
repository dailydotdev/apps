import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import {
  BlockIcon,
  EyeIcon,
  FlagIcon,
  MenuIcon,
  ShareIcon,
  TrendingIcon,
} from '../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { Squad } from '../../../graphql/sources';
import { useCampaignById } from '../../../graphql/campaigns';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLazyModal } from '../../../hooks/useLazyModal';
import type { MenuItemProps } from '../../dropdown/common';
import { LazyModal } from '../../modals/common/types';
import useMutateFilters from '../../../hooks/useMutateFilters';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useShareOrCopyLink } from '../../../hooks/useShareOrCopyLink';
import { LogEvent } from '../../../lib/log';
import { plusUrl } from '../../../lib/constants';

interface SquadOptionsButtonProps {
  squad: Squad;
  className?: string;
}

export function SquadOptionsButton({
  squad,
  className,
}: SquadOptionsButtonProps): ReactElement {
  const { openModal } = useLazyModal();
  const { user } = useAuthContext();
  const { data: campaign } = useCampaignById(squad.flags.campaignId);
  const isBooster = campaign && user?.id === campaign.user.id;
  const [, onShareOrCopy] = useShareOrCopyLink({
    link: squad.permalink,
    text: `Check out ${squad.handle} on daily.dev`,
    logObject: () => ({ event_name: LogEvent.ShareSource }),
  });
  const { blockSource, unblockSource } = useMutateFilters(user);
  const { feedSettings } = useFeedSettings();
  const isSourceBlocked = useMemo(() => {
    return !!feedSettings?.excludeSources?.some(
      (excludedSource) => excludedSource.id === squad?.id,
    );
  }, [feedSettings?.excludeSources, squad?.id]);

  const options = useMemo(() => {
    const blockAction = isSourceBlocked ? unblockSource : blockSource;
    const list: MenuItemProps[] = [
      { label: 'Share via', icon: <ShareIcon />, action: onShareOrCopy },
      {
        label: 'Hide',
        icon: <EyeIcon />,
        anchorProps: {
          href: plusUrl,
          target: '_blank',
        },
      },
      {
        label: `${isSourceBlocked ? 'Unblock' : 'Block'} ${squad.handle}`,
        icon: <BlockIcon />,
        action: () => blockAction({ source: squad }),
      },
      {
        label: 'Report',
        icon: <FlagIcon />,
        action: () =>
          openModal({ type: LazyModal.ReportSource, props: { squad } }),
      },
    ];

    if (isBooster) {
      list.unshift({
        label: 'Manade Ad',
        icon: <TrendingIcon />,
        action: () =>
          openModal({
            type: LazyModal.BoostedCampaignView,
            props: { campaign },
          }),
      });
    }

    return list;
  }, [
    isSourceBlocked,
    unblockSource,
    blockSource,
    onShareOrCopy,
    squad,
    isBooster,
    openModal,
    campaign,
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          className={classNames('invisible z-1 group-hover:visible', className)}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
