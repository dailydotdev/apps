import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ModalProps } from './StyledModal';
import SteppedModal from './SteppedModal';
import FeedTopicCard from '../containers/FeedTopicCard';
import FeedFilterStep from '../containers/FeedFilterStep';
import useFeedSettings from '../../hooks/useFeedSettings';
import { CustomSwitch } from '../fields/CustomSwitch';
import { getFilterCardPreviews } from '../filters/FilterCardPreview';
import { cloudinary } from '../../lib/image';
import ThemeWidget from '../widgets/ThemeWidget';
import { ThemeMode } from '../../contexts/SettingsContext';

interface FeedFitlersModalProps extends ModalProps {
  trigger?: string;
}

const themes = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'Auto', value: 'auto' },
];

function FeedFitlersModal(props: FeedFitlersModalProps): ReactElement {
  const [selectedTheme, setSelectedTheme] = useState(ThemeMode.Auto);
  const [isListMode, setIsListMode] = useState(false);
  const [selected, setSelected] = useState({});
  const { tagsCategories } = useFeedSettings();
  const [step, setStep] = useState(0);
  const onStepChange = (beforeStep: number, stepNow: number) => {
    setStep(stepNow);
  };

  return (
    <SteppedModal
      {...props}
      contentClassName={step === 0 && 'overflow-y-hidden'}
      style={{ content: { maxHeight: '40rem' } }}
      onStepChange={onStepChange}
      isLastStepLogin
    >
      <FeedFilterStep
        title="Make the feed, your feed."
        description="Devs with a personal feed get 11.5x more relevant articles!"
        className={{ container: 'relative' }}
      >
        <img
          className="absolute -mt-4 scale-125"
          src={cloudinary.feedFilters.yourFeed}
          alt="cards containing tag name being selected"
        />
      </FeedFilterStep>
      <FeedFilterStep
        topIcon={
          <img
            className="mx-auto mb-6 w-16"
            src={cloudinary.feedFilters.supercharge}
            alt="test"
          />
        }
        title="Let’s super-charge your feed with the content you actually read!"
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
          content: classNames(
            'relative flex flex-col items-center w-4/5 mt-8',
            isListMode && 'px-8',
          ),
        }}
      >
        <img
          className="absolute -top-4 -left-2"
          src={cloudinary.feedFilters.recommended}
          alt="Pointing at the recommended layout"
        />
        <CustomSwitch
          inputId="feed_layout"
          name="feed_layout"
          leftContent="Cards"
          rightContent="List"
          checked={isListMode}
          onToggle={() => setIsListMode(!isListMode)}
        />
        <div
          className={classNames(
            'grid relative gap-3 mt-11',
            isListMode ? 'grid-cols-1 w-full' : 'grid-cols-3 w-fit',
          )}
        >
          <div
            className="absolute inset-0 rounded-8"
            style={{
              background:
                'linear-gradient(45deg, rgba(23, 25, 31, 1) 0%, rgba(23, 25, 31, 0) 100%)',
            }}
          />
          {getFilterCardPreviews(6, isListMode)}
        </div>
      </FeedFilterStep>
      <FeedFilterStep
        title="Your eyes don’t lie"
        description="Dark mode will emit less blue light from your screen - which can keep you awake if you use your device before you go to bed"
        className={{ content: 'grid grid-cols-1 gap-6 mt-11 px-11' }}
      >
        {themes.map((theme) => (
          <ThemeWidget
            key={theme.label}
            option={theme}
            value={selectedTheme}
            onChange={setSelectedTheme}
          />
        ))}
      </FeedFilterStep>
    </SteppedModal>
  );
}

export default FeedFitlersModal;
