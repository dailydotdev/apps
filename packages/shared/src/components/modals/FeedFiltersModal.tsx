import React, { ReactElement, useState } from 'react';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import FeedTopicCard from '../containers/FeedTopicCard';
import FeedFilterStep from '../containers/FeedFilterStep';
import useFeedSettings from '../../hooks/useFeedSettings';
import classed from '../../lib/classed';
import { CustomSwitch } from '../fields/CustomSwitch';

interface FeedFitlersModalProps extends ModalProps {
  trigger?: string;
}

const CardPreviewPlaceholder = classed(
  'div',
  'rounded-8 bg-theme-divider-secondary w-full',
);

const CardPreview = () => (
  <div className="flex flex-col p-2 w-24 h-28 rounded-8 bg-theme-divider-tertiary">
    <CardPreviewPlaceholder className="h-2.5" />
    <CardPreviewPlaceholder className="mt-1 w-3/4 h-2.5" />
    <CardPreviewPlaceholder className="mt-auto h-12" />
  </div>
);

function FeedFitlersModal(props: FeedFitlersModalProps): ReactElement {
  const [isInsaneMode, setIsInsaneMode] = useState(false);
  const [selected, setSelected] = useState({});
  const { tagsCategories } = useFeedSettings();
  const onNext = () => {};

  return (
    <SteppedModal {...props} onNext={onNext} isLastStepLogin>
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
        className={{
          container: 'items-center',
          content: 'relative flex flex-col items-center mt-8',
        }}
      >
        <img
          className="absolute -top-4 -left-2"
          src="/recommended.png"
          alt="Pointing at the recommended layout"
        />
        <CustomSwitch
          inputId="feed_layout"
          name="feed_layout"
          leftContent="Cards"
          rightContent="List"
          checked={isInsaneMode}
          onToggle={() => setIsInsaneMode(!isInsaneMode)}
        />
        <div className="grid relative grid-cols-3 gap-3 mt-11 w-fit">
          <div
            className="absolute inset-0 rounded-8"
            style={{
              background:
                'linear-gradient(45deg, rgba(23, 25, 31, 1) 0%, rgba(23, 25, 31, 0) 100%)',
            }}
          />
          <CardPreview />
          <CardPreview />
          <CardPreview />
          <CardPreview />
          <CardPreview />
          <CardPreview />
        </div>
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
