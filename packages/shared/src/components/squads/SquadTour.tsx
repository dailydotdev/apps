import React, { ReactElement, useState } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { Justify } from '../utilities';
import Carousel from '../containers/Carousel';
import { ModalFooter } from '../modals/common/ModalFooter';
import SquadTourCard from './SquadTourCard';
import classed from '../../lib/classed';

interface SquadTourProps {
  onClose: React.EventHandler<React.MouseEvent>;
}

const FooterButton = classed(Button, 'w-22');

function SquadTour({ onClose }: SquadTourProps): ReactElement {
  const [shouldShowCarousel, setShouldShowCarousel] = useState(false);

  if (!shouldShowCarousel) {
    return (
      <>
        <SquadTourCard
          key="intro"
          banner={cloudinary.squads.tour.banner0}
          title="Let's see what you can do with Squads!"
          className={{ container: 'h-[29.25rem]' }}
        />
        <ModalFooter>
          <FooterButton className="btn-tertiary" onClick={onClose}>
            Close
          </FooterButton>
          <FooterButton
            className="ml-auto btn-primary-cabbage"
            onClick={() => setShouldShowCarousel(true)}
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
      banner={cloudinary.squads.tour.banner1}
      title="Share articles"
      description="Share articles, receive and give feedback!"
      badge="NEW"
    />,
    <SquadTourCard
      key="step2"
      banner={cloudinary.squads.tour.banner2}
      title="Share from main feed"
      description="Share articles using the share button!"
      className={{ banner: '!px-2' }}
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
      banner={cloudinary.squads.tour.banner4}
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

export default SquadTour;
