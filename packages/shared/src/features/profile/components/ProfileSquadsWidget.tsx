import React from 'react';
import type { Squad } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { labels, largeNumberFormat } from '../../../lib';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonIconPosition,
} from '../../../components/buttons/Button';
import { StraightArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { webappUrl } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

import { LazyImage } from '../../../components/LazyImage';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../../components/typography/Typography';
import { useViewSize, ViewSize, useToastNotification } from '../../../hooks';
import { SquadActionButton } from '../../../components/squads/SquadActionButton';
import { Origin } from '../../../lib/log';
import { useToggle } from '../../../hooks/useToggle';
import { ActivityContainer } from '../../../components/profile/ActivitySection';
import {
  useSources,
  getFlatteredSources,
} from '../../../hooks/source/useSources';

interface ProfileSquadsWidgetProps {
  squads: Array<Squad>;
  userId: string;
}

interface SquadListItemProps {
  squad: Squad;
}

const MOBILE_MAX_SQUADS = 3;
const DESKTOP_MAX_SQUADS = 5;

const useProfileSquadsWidget = (props: ProfileSquadsWidgetProps) => {
  const { squads, userId } = props;
  const { isAuthReady, user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileXL);
  const [showAll, toggleShowAll] = useToggle(false);

  const isSameUser = user?.id === userId;
  const isShowingSuggestions = isSameUser && !squads?.length;
  const heading = isShowingSuggestions
    ? labels.profile.sources.heading.empty
    : labels.profile.sources.heading.activeIn;

  const {
    result: { data, isPending },
  } = useSources({
    query: {
      first: DESKTOP_MAX_SQUADS,
      isPublic: true,
      sortByMembersCount: true,
    },
    isEnabled: isShowingSuggestions,
  });
  const flatSquads = getFlatteredSources({ data }) as Squad[];
  const list = isShowingSuggestions ? flatSquads : squads;
  const maxLength = isMobile ? MOBILE_MAX_SQUADS : DESKTOP_MAX_SQUADS;
  const visibleSquads = showAll ? list : list.slice(0, maxLength);
  const hasShowMore = list.length > maxLength;

  return {
    heading,
    isReady: isAuthReady && (!isShowingSuggestions || !isPending),
    isShowingSuggestions,
    showMore: {
      isVisible: hasShowMore,
      isActive: showAll,
      toggle: toggleShowAll,
    },
    squads: visibleSquads,
  };
};

const SquadListItem = ({ squad }: SquadListItemProps) => {
  const { displayToast } = useToastNotification();
  const { squads, isAuthReady } = useAuthContext();
  const hasJoined = squads?.some((sq) => sq.id === squad.id);

  if (!isAuthReady) {
    return null;
  }

  return (
    <li className="flex flex-row items-center gap-2">
      <a href={squad.permalink} target="_blank" rel={anchorDefaultRel}>
        <LazyImage
          className="size-8 cursor-pointer rounded-full"
          imgAlt={squad.name}
          imgSrc={squad.image}
        />
      </a>
      <div className="min-w-0 flex-1">
        <a href={squad.permalink} target="_blank" rel={anchorDefaultRel}>
          <Typography
            bold
            tag={TypographyTag.H5}
            type={TypographyType.Callout}
            truncate
            data-testid="squad-list-item-name"
          >
            {squad.name}
          </Typography>
        </a>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
          truncate
        >
          @{squad.handle}
        </Typography>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
          truncate
        >
          {largeNumberFormat(squad.membersCount)} member
          {squad.membersCount !== 1 && 's'}
        </Typography>
      </div>
      {!hasJoined && (
        <SquadActionButton
          alwaysShow
          copy={{ join: 'Join', leave: 'Leave' }}
          onSuccess={() => {
            displayToast(`🙌 You joined the Squad ${squad.name}`);
          }}
          origin={Origin.Profile}
          size={ButtonSize.Small}
          squad={{ ...squad, currentMember: null }}
        />
      )}
    </li>
  );
};

export const ProfileSquadsWidget = (props: ProfileSquadsWidgetProps) => {
  const { heading, squads, showMore, isReady, isShowingSuggestions } =
    useProfileSquadsWidget(props);

  if (!squads.length || !isReady) {
    return null;
  }

  return (
    <ActivityContainer className="mx-4">
      <Typography
        bold
        color={TypographyColor.Primary}
        tag={TypographyTag.H4}
        type={TypographyType.Callout}
      >
        {heading}
      </Typography>
      <ul className="mt-4 flex flex-col gap-2">
        {squads.map((squad) => (
          <SquadListItem key={squad.id} squad={squad} />
        ))}
      </ul>
      {isShowingSuggestions && (
        <Button
          className="mt-3 w-full"
          href={`${webappUrl}squads/discover`}
          icon={
            <StraightArrowIcon
              aria-hidden
              className="-rotate-90"
              size={IconSize.Size16}
            />
          }
          iconPosition={ButtonIconPosition.Right}
          rel={anchorDefaultRel}
          size={ButtonSize.Small}
          tag="a"
          target="_blank"
          variant={ButtonVariant.Subtle}
        >
          {labels.profile.sources.viewAll}
        </Button>
      )}
      {showMore.isVisible && (
        <Button
          className="mt-3 w-full"
          onClick={() => showMore.toggle()}
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
        >
          {showMore.isActive ? 'Show less' : 'Show more Squads'}
        </Button>
      )}
    </ActivityContainer>
  );
};

export default ProfileSquadsWidget;
