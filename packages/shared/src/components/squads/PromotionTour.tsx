import React, { ReactElement, useMemo } from 'react';
import { cloudinary } from '../../lib/image';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { FlexCentered, Justify } from '../utilities';
import Carousel from '../containers/Carousel';
import { ModalFooter } from '../modals/common/ModalFooter';
import SquadTourCard from './SquadTourCard';
import classed from '../../lib/classed';
import { Source, SourceMemberRole } from '../../graphql/sources';
import { StarIcon, UserIcon } from '../icons';
import { capitalize } from '../../lib/strings';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';
import { IconSize } from '../Icon';
import SourceButton from '../cards/SourceButton';

interface PromotionTourProps {
  onClose: React.EventHandler<React.MouseEvent>;
  source: Source;
}

const bannerClass = 'h-60 bg-cover';

const FooterButton = classed(Button, 'w-22');
const iconMap = {
  [SourceMemberRole.Moderator]: UserIcon,
  [SourceMemberRole.Admin]: StarIcon,
};
const roleDescription = {
  [SourceMemberRole.Moderator]:
    'As a moderator, you will have the opportunity to help guide and shape the Squad, ensuring that all members have a positive and productive experience.',
  [SourceMemberRole.Admin]:
    'As an admin, you will have full permissions to manage and guide the Squad, ensuring that all members and moderators have a positive and productive experience.',
};
const firstStep = {
  [SourceMemberRole.Moderator]: (
    <SquadTourCard
      key="step1"
      bannerAsBg
      className={{ banner: bannerClass }}
      banner={cloudinary.squads.promotion.remove}
      title="Manage Squad members"
      description="Maintain a harmonious Squad by overseeing membership and removing those no longer contributing positively."
    />
  ),
  [SourceMemberRole.Admin]: (
    <SquadTourCard
      key="step1"
      bannerAsBg
      className={{ banner: bannerClass }}
      banner={cloudinary.squads.promotion.promote}
      title="Manage roles and permissions"
      description="Take charge of your Squad by promoting or demoting members and moderators according to their engagement and contributions."
    />
  ),
};

function PromotionTour({ onClose, source }: PromotionTourProps): ReactElement {
  const { user } = useAuthContext();
  const items = useMemo(() => {
    const { role } = source.currentMember;
    const tour = [];
    const Icon = iconMap[role];

    tour.push(
      <SquadTourCard
        key="intro"
        bannerAsBg
        className={{ container: 'relative', banner: bannerClass }}
        banner={cloudinary.squads.promotion.banner}
        title="You have been promoted"
        description={roleDescription[role]}
      >
        <FlexCentered className="absolute left-1/2 top-20 -translate-x-1/2 justify-center gap-1">
          <span className="relative">
            <ProfilePicture user={user} size={ProfileImageSize.XXXXLarge} />
            <SourceButton
              className="absolute -bottom-4 -right-4"
              source={source}
              size={ProfileImageSize.XLarge}
            />
          </span>
          <Icon size={IconSize.XLarge} className="ml-3" secondary />
          <span className="font-bold typo-title1">{capitalize(role)}</span>
        </FlexCentered>
      </SquadTourCard>,
    );

    tour.push(firstStep[role]);

    tour.push(
      <SquadTourCard
        key="step2"
        bannerAsBg
        className={{ banner: bannerClass }}
        banner={cloudinary.squads.promotion.delete}
        title="Remove posts and comments"
        description="Uphold your squad’s standards by removing off-topic or inappropriate content."
      />,
    );

    if (role === SourceMemberRole.Admin) {
      tour.push(
        <SquadTourCard
          key="step2"
          bannerAsBg
          className={{ banner: bannerClass }}
          banner={cloudinary.squads.promotion.settings}
          title="Customize Squad settings"
          description="Tailor your community experience by managing posting rights, member invitation privileges, and editing Squad details."
        />,
      );
    }

    tour.push(
      <SquadTourCard
        key="step2"
        bannerAsBg
        className={{ banner: bannerClass }}
        banner={cloudinary.squads.promotion.invite}
        title="Grow your Squad"
        description="Strengthen your Squad's network by bringing in new members to collaborate and exchange insights."
      />,
    );

    return tour;
  }, [source, user]);

  return (
    <Carousel
      hasCustomIndicator
      items={items}
      className={{ wrapper: 'w-full' }}
      onClose={() => onClose?.(null)}
      onEnd={() => onClose?.(null)}
    >
      {({ onSwipedLeft, onSwipedRight, index }, indicator) => (
        <>
          <span className="mb-3 flex w-full justify-center tablet:hidden">
            {indicator}
          </span>
          <ModalFooter justify={Justify.Between}>
            <FooterButton
              variant={ButtonVariant.Tertiary}
              onClick={(e) => onSwipedRight(e)}
            >
              {index === 0 ? 'Close' : 'Back'}
            </FooterButton>
            {indicator}
            <FooterButton
              variant={ButtonVariant.Primary}
              color={ButtonColor.Cabbage}
              onClick={(e) => onSwipedLeft(e)}
            >
              {index === items.length - 1 ? 'Close' : 'Next'}
            </FooterButton>
          </ModalFooter>
          )
        </>
      )}
    </Carousel>
  );
}

export default PromotionTour;
