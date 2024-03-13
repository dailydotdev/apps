import React, { ReactElement, useState } from 'react';
import { cloudinary } from '../../lib/image';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { Justify } from '../utilities';
import Carousel from '../containers/Carousel';
import { ModalFooter } from '../modals/common/ModalFooter';
import SquadTourCard from './SquadTourCard';
import classed from '../../lib/classed';
import { useSquadTour } from '../../hooks/useSquadTour';
import { PopupCloseEvent } from '../modals/common';
import { useViewSize, ViewSize } from '../../hooks';

interface SquadTourProps {
  onClose: PopupCloseEvent;
}

const FooterButton = classed(Button, 'w-22');

export enum TourScreenIndex {
  Post = 0,
  CopyInvitation = 3,
}

function SquadTour({ onClose }: SquadTourProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [shouldShowCarousel, setShouldShowCarousel] = useState(false);
  const { onTourIndexChange } = useSquadTour();

  if (!shouldShowCarousel && !isMobile) {
    return (
      <>
        <SquadTourCard
          key="intro"
          banner={cloudinary.squads.tour.banner0}
          title="Let's see what you can do with Squads!"
          className={{ container: 'h-[29.25rem]', banner: '!pt-0' }}
        />
        <ModalFooter>
          <FooterButton
            variant={ButtonVariant.Tertiary}
            onClick={(e) => onClose(e.nativeEvent)}
          >
            Close
          </FooterButton>
          <FooterButton
            className="ml-auto"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            onClick={() => {
              onTourIndexChange(0);
              setShouldShowCarousel(true);
            }}
          >
            Start
          </FooterButton>
        </ModalFooter>
      </>
    );
  }

  const items = [
    <SquadTourCard
      key="step1"
      banner={cloudinary.squads.tour.banner1_v2}
      title="Share articles"
      description="Share articles, receive and give feedback!"
      badge="NEW"
    />,
    <SquadTourCard
      key="step2"
      banner={cloudinary.squads.tour.banner2}
      title="Share from main feed"
      description="Share articles using the share button!"
      badge="NEW"
    />,
    <SquadTourCard
      key="step3"
      banner={cloudinary.squads.tour.banner3}
      title="Private discussions"
      description="Hold private discussions and stay up to date with friends, colleagues and like-minded developers."
      badge="NEW"
    />,
    <SquadTourCard
      key="step4"
      banner={cloudinary.squads.tour.banner4_v2}
      title="Invite members"
      description="Invite friends and colleagues to your Squads"
      badge="NEW"
    />,
  ];

  return (
    <Carousel
      hasCustomIndicator
      items={items}
      className={{ wrapper: 'w-full' }}
      onClose={() => onClose?.(null)}
      onEnd={() => onClose?.(null)}
      onScreenIndexChange={onTourIndexChange}
    >
      {({ onSwipedLeft, onSwipedRight, index }, indicator) =>
        isMobile ? (
          <span className="mb-3 flex w-full justify-center">{indicator}</span>
        ) : (
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
      }
    </Carousel>
  );
}

export default SquadTour;
