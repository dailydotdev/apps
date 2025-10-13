import React from 'react';
import {
  WidgetCard,
  WidgetVariant,
} from '../../../components/widgets/WidgetCard';
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

interface ProfileSquadsWidgetProps {
  userId: string;
  squads: Array<Squad>;
}

interface SquadListItemProps {
  squad: Squad;
}

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

const MOBILE_MAX_SQUADS = 3;
const DESKTOP_MAX_SQUADS = 5;

export const ProfileSquadsWidget = ({
  userId,
  squads,
}: ProfileSquadsWidgetProps) => {
  const { user } = useAuthContext();
  const isSameUser = user?.id === userId;
  const showSuggestions = isSameUser && !squads?.length;
  const heading =
    labels.profile.sources.heading[showSuggestions ? 'empty' : 'activeIn'];
  const isMobile = useViewSize(ViewSize.MobileXL);
  const [showAll, toggleShowAll] = useToggle(false);

  if (!squads.length) {
    // todo: add suggested squad list here
    return null;
  }

  const maxLength = isMobile ? MOBILE_MAX_SQUADS : DESKTOP_MAX_SQUADS;
  const hasMore = squads.length > maxLength;
  const visibleSquads = showAll ? squads : squads.slice(0, maxLength);

  return (
    <WidgetCard heading={heading} variant={WidgetVariant.Minimal}>
      <ul className="flex flex-col gap-2">
        {visibleSquads.map((squad) => (
          <SquadListItem key={squad.id} squad={squad} />
        ))}
      </ul>
      {showSuggestions && (
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
      {hasMore && !showSuggestions && (
        <Button
          className="mt-3 w-full"
          onClick={() => toggleShowAll()}
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
        >
          {showAll ? 'Show less' : 'Show more Squads'}
        </Button>
      )}
    </WidgetCard>
  );
};
