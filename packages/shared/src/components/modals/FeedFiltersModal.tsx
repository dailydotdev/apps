import React, { ReactElement, useState } from 'react';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import FeedTopicCard from '../containers/FeedTopicCard';
import FeedFilterStep from '../containers/FeedFilterStep';
import useFeedSettings from '../../hooks/useFeedSettings';

interface FeedFitlersModalProps extends ModalProps {
  trigger?: string;
}

function FeedFitlersModal(props: FeedFitlersModalProps): ReactElement {
  const [selected, setSelected] = useState({});
  const { tagsCategories } = useFeedSettings();

  return (
    <SteppedModal {...props} isOpen isLastStepLogin>
      <FeedFilterStep
        title="Make the feed, your feed."
        description="Devs with a personal feed get 11.5x more relevant articles!"
        className={{ container: 'relative' }}
      >
        <img
          className="absolute"
          src="/your_feed.png"
          alt="cards containing tag name being selected"
        />
      </FeedFilterStep>
      <FeedFilterStep
        title="Choose topics to follow"
        description="Pick a few subjects that interest you. You can always change these later."
        className={{ content: 'p-5 mt-1 grid grid-cols-3 gap-6' }}
      >
        {tagsCategories?.map((category, i) => (
          <FeedTopicCard
            key={category.title}
            topic={category}
            isActive={selected[i]}
            onClick={() => setSelected({ ...selected, [i]: !selected[i] })}
          />
        ))}
      </FeedFilterStep>
      <FeedFilterStep
        title="Cards or list?"
        description="daily content can be presented in cards or a list, choose what works for you the best"
      >
        Test Sample Aaa
      </FeedFilterStep>
      <FeedFilterStep
        title="Your eyes don’t lie"
        description="Dark mode will less emit ׳blue light' from your screen -  which can keep you awake if you use your device before you go to bed"
      >
        Test Sample Aaa
      </FeedFilterStep>
    </SteppedModal>
  );
}

export default FeedFitlersModal;
