import React from 'react';
import type { Squad } from '../../../../graphql/sources';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { labels } from '../../../../lib';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonIconPosition,
} from '../../../../components/buttons/Button';
import { StraightArrowIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { webappUrl } from '../../../../lib/constants';
import { anchorDefaultRel } from '../../../../lib/strings';
import { useToggle } from '../../../../hooks/useToggle';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import {
  useSources,
  getFlatteredSources,
} from '../../../../hooks/source/useSources';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../../../../components/typography/Typography';
import {
  SquadListItem,
  ActiveOrRecomendedSquadsSkeleton,
} from './ActiveOrRecomendedSquadsComponents';

interface ActiveOrRecomendedSquadsProps {
  squads: Array<Squad>;
  userId: string;
}

const MAX_SQUAD_COUNT = 5;

const useActiveOrRecomendedSquads = (props: ActiveOrRecomendedSquadsProps) => {
  const { squads, userId } = props;
  const { isAuthReady, user } = useAuthContext();
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
      first: MAX_SQUAD_COUNT,
      isPublic: true,
      sortByMembersCount: true,
    },
    isEnabled: isShowingSuggestions,
  });
  const flatSquads = getFlatteredSources({ data }) as Squad[];
  const list = isShowingSuggestions ? flatSquads : squads;
  const visibleSquads = showAll ? list : list.slice(0, MAX_SQUAD_COUNT);
  const hasShowMore = list.length > MAX_SQUAD_COUNT;

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

export const ActiveOrRecomendedSquads = (
  props: ActiveOrRecomendedSquadsProps,
) => {
  const { heading, squads, showMore, isReady, isShowingSuggestions } =
    useActiveOrRecomendedSquads(props);

  if (!isReady) {
    return <ActiveOrRecomendedSquadsSkeleton />;
  }

  if (!squads.length) {
    return null;
  }

  return (
    <ActivityContainer>
      <div className="flex min-h-0 flex-1 flex-col">
        <Typography
          bold
          color={TypographyColor.Primary}
          tag={TypographyTag.H4}
          type={TypographyType.Callout}
        >
          {heading}
        </Typography>
        <ul className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto laptop:max-h-none laptop:overflow-y-visible">
          {squads.map((squad) => (
            <SquadListItem
              key={squad.id}
              showJoinButton={isShowingSuggestions}
              squad={squad}
            />
          ))}
        </ul>
        <div className="mt-auto pt-3">
          {isShowingSuggestions && (
            <Button
              className="w-full"
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
              className="w-full"
              onClick={() => showMore.toggle()}
              size={ButtonSize.Small}
              variant={ButtonVariant.Subtle}
            >
              {showMore.isActive ? 'Show less' : 'Show all Squads'}
            </Button>
          )}
        </div>
      </div>
    </ActivityContainer>
  );
};

export default ActiveOrRecomendedSquads;
