import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { SourcePermissions } from '../../../../graphql/sources';
import { verifyPermission } from '../../../../graphql/squads';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  BellIcon,
  EditIcon,
  LinkIcon,
  SearchIcon,
  TourIcon,
} from '../../../../components/icons';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { SquadActionButton } from '../../../../components/squads/SquadActionButton';
import { BoostSourceButton } from '../../../boost/BoostSourceButton';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useShareOrCopyLink } from '../../../../hooks/useShareOrCopyLink';
import { useSpotlight } from '../../../../components/spotlight/SpotlightContext';
import { LogEvent, Origin } from '../../../../lib/log';
import { ReferralCampaignKey } from '../../../../lib/referral';
import { useSquadPageContext } from '../../SquadPageContext';
import { isJoinedViewer, SquadViewer } from '../../lib/viewer';
import { getSquadManageUrl, SquadManageSection } from '../../lib/routes';
import { getSquadSpotlightSource } from '../../lib/spotlight';
import { getSquadShareText } from '../widgets/SquadShareWidget';
import { SquadOptionsMenu } from './SquadOptionsMenu';
import { useMobileAppHeader } from '../../../getApp/hooks/useMobileAppHeader';
import { ShellSquare } from '../../../../components/shell/ShellSquare';
import { useIsPhone } from '../../../../hooks/useViewSize';
import { IconSize } from '../../../../components/Icon';

const useSquadShare = () => {
  const { squad } = useSquadPageContext();

  return useShareOrCopyLink({
    link: squad.permalink,
    text: getSquadShareText(squad),
    cid: ReferralCampaignKey.ShareSource,
    logObject: (provider) => ({
      event_name: LogEvent.ShareSource,
      target_id: squad.id,
      extra: JSON.stringify({ provider, origin: Origin.SquadPage }),
    }),
  });
};

const SquadJoinButton = ({
  size,
  className,
}: {
  size: ButtonSize;
  className?: string;
}): ReactElement | null => {
  const { squad, viewer, isPreviewing } = useSquadPageContext();

  if (
    viewer === SquadViewer.Admin ||
    (!squad.public && !isJoinedViewer(viewer))
  ) {
    return null;
  }

  // The preview renders the visitor's button without letting staff act on it.
  if (isPreviewing) {
    return (
      <Button variant={ButtonVariant.Primary} size={size} className={className}>
        Join Squad
      </Button>
    );
  }

  return (
    <SquadActionButton
      alwaysShow
      squad={squad}
      origin={Origin.SquadPage}
      size={size}
      className={{ button: className }}
      copy={{ leave: 'Joined' }}
      buttonVariants={[ButtonVariant.Primary, ButtonVariant.Subtle]}
    />
  );
};

const canBoost = (
  squad: ReturnType<typeof useSquadPageContext>['squad'],
): boolean =>
  squad.public && verifyPermission(squad, SourcePermissions.BoostSquad);

export const SquadActions = (): ReactElement => {
  const router = useRouter();
  const { squad, viewer } = useSquadPageContext();
  const { openModal, modal } = useLazyModal();
  const { openWithSource } = useSpotlight();
  const [, onShare] = useSquadShare();
  const isAdminView = viewer === SquadViewer.Admin;
  const canEdit = verifyPermission(squad, SourcePermissions.Edit);
  const editUrl = getSquadManageUrl(squad.handle, SquadManageSection.Details);
  const isMobileAppHeader = useMobileAppHeader();
  const isPhone = useIsPhone();

  return (
    <div className="flex items-center gap-2 pb-1">
      {canEdit && (
        <Tooltip content="Edit page">
          <Button
            tag="a"
            href={editUrl}
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<EditIcon />}
            aria-label="Edit page"
            onClick={(event: MouseEvent) => {
              event.preventDefault();
              router.push(editUrl);
            }}
          />
        </Tooltip>
      )}
      {isJoinedViewer(viewer) && (
        <Tooltip content="Squad notifications settings">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={
              <BellIcon
                secondary={modal?.type === LazyModal.SquadNotifications}
              />
            }
            aria-label="Squad notifications settings"
            onClick={() =>
              openModal({
                type: LazyModal.SquadNotifications,
                props: { squad },
              })
            }
          />
        </Tooltip>
      )}
      <span className={classNames('flex', isAdminView && 'hidden tablet:flex')}>
        <Tooltip content="Share">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<LinkIcon />}
            aria-label="Share"
            onClick={onShare}
          />
        </Tooltip>
      </span>
      {!isPhone && (
        <span className="hidden tablet:contents">
          <Tooltip content={`Search ${squad.name}`}>
            <Button
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              icon={<SearchIcon />}
              aria-label={`Search ${squad.name}`}
              onClick={() => openWithSource(getSquadSpotlightSource(squad))}
            />
          </Tooltip>
          {!isMobileAppHeader && <SquadOptionsMenu />}
        </span>
      )}
      {canBoost(squad) && (
        <span className="hidden tablet:flex">
          <BoostSourceButton
            squad={squad}
            buttonProps={{ size: ButtonSize.Small }}
          />
        </span>
      )}
      <span className="hidden tablet:flex">
        <SquadJoinButton size={ButtonSize.Small} />
      </span>
    </div>
  );
};

export const SquadBlockActions = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { openWithSource } = useSpotlight();
  const isMobileAppHeader = useMobileAppHeader();

  return (
    <>
      <ShellSquare
        aria-label={`Search ${squad.name}`}
        onClick={() => openWithSource(getSquadSpotlightSource(squad))}
      >
        <SearchIcon size={IconSize.Small} />
      </ShellSquare>
      {!isMobileAppHeader && (
        <SquadOptionsMenu
          variant={ButtonVariant.Tertiary}
          className="shell-material !size-[2.375rem] !rounded-14 !p-0"
        />
      )}
    </>
  );
};

/** On phones the primary actions leave the icon row for full width buttons. */
export const SquadPhoneActions = (): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const [, onShare] = useSquadShare();
  const { openModal } = useLazyModal();
  const isMobileAppHeader = useMobileAppHeader();

  if (viewer !== SquadViewer.Admin) {
    return (
      <div className="mt-4 flex flex-col gap-2 empty:hidden tablet:hidden">
        <SquadJoinButton size={ButtonSize.Medium} className="w-full" />
        {isMobileAppHeader && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            icon={<TourIcon />}
            onClick={() => openModal({ type: LazyModal.SquadTour })}
          >
            Learn how Squads work
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 flex gap-2 tablet:hidden">
      {canBoost(squad) && (
        <span className="flex flex-1">
          <BoostSourceButton
            squad={squad}
            buttonProps={{ size: ButtonSize.Medium, className: 'w-full' }}
          />
        </span>
      )}
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Medium}
        className="flex-1"
        onClick={onShare}
      >
        Share page
      </Button>
    </div>
  );
};
