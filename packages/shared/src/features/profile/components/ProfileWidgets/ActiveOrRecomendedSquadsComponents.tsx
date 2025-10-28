import type { ReactElement } from 'react';
import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { largeNumberFormat } from '../../../../lib';
import { anchorDefaultRel } from '../../../../lib/strings';
import { LazyImage } from '../../../../components/LazyImage';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../../../components/typography/Typography';
import { useToastNotification } from '../../../../hooks';
import { SquadActionButton } from '../../../../components/squads/SquadActionButton';
import { Origin } from '../../../../lib/log';
import { ButtonSize } from '../../../../components/buttons/Button';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

interface SquadListItemProps {
  squad: Squad;
  showJoinButton?: boolean;
}

export const SquadListItem = ({
  squad,
  showJoinButton = false,
}: SquadListItemProps): ReactElement | null => {
  const { displayToast } = useToastNotification();
  const { squads, isAuthReady } = useAuthContext();
  const hasSquadsInList = squads?.some((sq) => sq.id === squad.id);

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
      {showJoinButton && !hasSquadsInList && (
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

// Skeleton components
const SquadListItemSkeleton = (): ReactElement => (
  <li className="flex flex-row items-center gap-2">
    <ElementPlaceholder className="size-8 rounded-full" />
    <div className="min-w-0 flex-1">
      <ElementPlaceholder className="mb-1 h-4 w-32 rounded-4" />
      <ElementPlaceholder className="mb-1 h-3 w-20 rounded-4" />
      <ElementPlaceholder className="h-3 w-24 rounded-4" />
    </div>
  </li>
);

export const ActiveOrRecomendedSquadsSkeleton = (): ReactElement => {
  return (
    <ActivityContainer>
      <div className="flex min-h-0 flex-1 flex-col">
        <ElementPlaceholder className="h-5 w-24 rounded-4" />
        <ul className="mt-4 flex flex-col gap-2">
          <SquadListItemSkeleton />
          <SquadListItemSkeleton />
          <SquadListItemSkeleton />
        </ul>
      </div>
    </ActivityContainer>
  );
};
