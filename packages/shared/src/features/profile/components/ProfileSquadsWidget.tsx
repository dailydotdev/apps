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
import { SquadActionButton } from '../../../components/squads/SquadActionButton';
import { Origin } from '../../../lib/log';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../../components/typography/Typography';
import { useViewSize, ViewSize } from '../../../hooks';

interface ProfileSquadsWidgetProps {
  userId: string;
  squads: Array<Squad>;
}

interface SquadListItemProps {
  squad: Squad;
  alwaysShowAction: boolean;
}

const SquadListItem = ({
  squad,
  alwaysShowAction = false,
}: SquadListItemProps) => (
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
    <SquadActionButton
      squad={squad}
      origin={Origin.Profile}
      copy={{
        join: 'Join',
        leave: 'Leave',
      }}
      alwaysShow={alwaysShowAction}
    />
  </li>
);

export const ProfileSquadsWidget = ({
  userId,
  squads,
}: ProfileSquadsWidgetProps) => {
  const { user, squads: userSquads } = useAuthContext();
  const userSquadIds = userSquads?.map((squad) => squad.id);
  const isSameUser = user?.id === userId;
  const showSuggestions = isSameUser && !squads?.length;
  const heading =
    labels.profile.sources.heading[showSuggestions ? 'empty' : 'activeIn'];
  const isMobile = useViewSize(ViewSize.MobileXL);

  if (!squads.length) {
    return null;
  }

  const shortList = squads.slice(0, isMobile ? 3 : 5);

  return (
    <WidgetCard heading={heading} variant={WidgetVariant.Minimal}>
      <ul className="flex flex-col gap-2">
        {shortList.map((squad) => (
          <SquadListItem
            key={squad.id}
            squad={squad}
            alwaysShowAction={!userSquadIds?.includes(squad.id)}
          />
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
    </WidgetCard>
  );
};
