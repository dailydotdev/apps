import React, { ReactElement, useState } from 'react';
import { Button } from '../buttons/Button';
import Carousel from '../containers/Carousel';
import SquadTourCard from '../squads/SquadTourCard';
import { Modal, ModalProps } from './common/Modal';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const [shouldShowCarousel, setShouldShowCarousel] = useState(false);

  const renderContent = () => {
    if (!shouldShowCarousel) {
      return (
        <>
          <SquadTourCard
            key="intro"
            banner="/squad_tour0.png"
            title="Let's see what you can do with Squads!"
          />
          <Modal.Footer>
            <Button className="btn-tertiary" onClick={onRequestClose}>
              Close
            </Button>
            <Button
              className="ml-auto btn-primary-cabbage"
              onClick={() => setShouldShowCarousel(true)}
            >
              Next
            </Button>
          </Modal.Footer>
        </>
      );
    }

    const items = [
      <SquadTourCard
        key="step1"
        banner="/squad_tour1.png"
        title="Share articles"
        description="Share articles, receive and give feedback!"
        badge="NEW"
      />,
      <SquadTourCard
        key="step2"
        banner="/squad_tour2.png"
        title="Share from main feed"
        description="Share articles using the share button!"
        className={{ banner: '!px-2' }}
        badge="NEW"
      />,
      <SquadTourCard
        key="step3"
        banner="/squad_tour3.png"
        title="Private discussions"
        description="Hold private discussions and stay up to date with friends, colleagues and like-minded developers."
        badge="NEW"
      />,
      <SquadTourCard
        key="step4"
        banner="/squad_tour4.png"
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
        onClose={() => onRequestClose?.(null)}
        onEnd={() => onRequestClose?.(null)}
      >
        {({ onSwipedLeft, onSwipedRight, index }, indicator) => (
          <span className="flex flex-row justify-between items-center p-3 border-t border-theme-divider-tertiary">
            <Button className="btn-tertiary" onClick={(e) => onSwipedRight(e)}>
              {index === 0 ? 'Close' : 'Back'}
            </Button>
            {indicator}
            <Button
              className="btn-primary-cabbage"
              onClick={(e) => onSwipedLeft(e)}
            >
              {index === items.length - 1 ? 'Close' : 'Next'}
            </Button>
          </span>
        )}
      </Carousel>
    );
  };

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-theme-color-cabbage"
    >
      {renderContent()}
    </Modal>
  );
}

export default SquadTourModal;
