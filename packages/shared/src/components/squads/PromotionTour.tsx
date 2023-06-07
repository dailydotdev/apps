import React, { ReactElement, useMemo } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { FlexCentered, Justify } from '../utilities';
import Carousel from '../containers/Carousel';
import { ModalFooter } from '../modals/common/ModalFooter';
import SquadTourCard from './SquadTourCard';
import classed from '../../lib/classed';
import { Source, SourceMemberRole } from '../../graphql/sources';
import { StarIcon, UserIcon } from '../icons';
import { capitalize } from '../../lib/strings';
import { ProfilePicture } from '../ProfilePicture';
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
    'As a moderator, you will have the opportunity to help guide and shape the squad, ensuring that all members have a positive and productive experience.',
  [SourceMemberRole.Admin]:
    'As an admin, you will have full permissions to manage and guide the squad, ensuring that all members and moderators have a positive and productive experience.',
};
const firstStep = {
  [SourceMemberRole.Moderator]: (
    <SquadTourCard
      key="step1"
      bannerAsBg
      className={{ banner: bannerClass }}
      banner={cloudinary.squads.promotion.remove}
      title="Manage squad members"
      description="Maintain a harmonious squad by overseeing membership and removing those no longer contributing positively."
    />
  ),
  [SourceMemberRole.Admin]: (
    <SquadTourCard
      key="step1"
      bannerAsBg
      className={{ banner: bannerClass }}
      banner={cloudinary.squads.promotion.promote}
      title="Manage roles and permissions"
      description="Take charge of your squad by promoting or demoting members and moderators according to their engagement and contributions."
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
        <FlexCentered className="absolute top-20 left-1/2 gap-1 justify-center -translate-x-1/2">
          <span className="relative">
            <ProfilePicture user={user} size="xxxxlarge" />
            <SourceButton
              className="absolute -right-4 -bottom-4"
              source={source}
              size="xlarge"
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
        banner={cloudinary.squads.promotion.remove}
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
          title="Customize squad settings"
          description="Tailor your community experience by managing posting rights, member invitation privileges, and editing squad details."
        />,
      );
    }

    tour.push(
      <SquadTourCard
        key="step2"
        bannerAsBg
        className={{ banner: bannerClass }}
        banner={cloudinary.squads.promotion.invite}
        title="Grow your squad"
        description="Strengthen your squad's network by bringing in new members to collaborate and exchange insights."
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
        <ModalFooter justify={Justify.Between}>
          <FooterButton
            className="btn-tertiary"
            onClick={(e) => onSwipedRight(e)}
          >
            {index === 0 ? 'Close' : 'Back'}
          </FooterButton>
          {indicator}
          <FooterButton
            className="btn-primary-cabbage"
            onClick={(e) => onSwipedLeft(e)}
          >
            {index === items.length - 1 ? 'Close' : 'Next'}
          </FooterButton>
        </ModalFooter>
      )}
    </Carousel>
  );
}

export default PromotionTour;
