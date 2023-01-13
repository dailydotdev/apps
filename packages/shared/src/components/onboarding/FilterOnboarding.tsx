import React, {
  ReactElement,
  useState,
  useContext,
  MouseEventHandler,
  MouseEvent,
} from 'react';
import classNames from 'classnames';
import Container from './OnboardingStep';
import FeedTopicCard, { ButtonEvent } from '../containers/FeedTopicCard';
import { OnboardingFiltersLayout } from '../../lib/featureValues';
import FeaturesContext from '../../contexts/FeaturesContext';
import useTagAndSource from '../../hooks/useTagAndSource';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Origin } from '../../lib/analytics';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { OnboardingStep, OnboardingStepProps } from './common';
import { useOnboardingSteps } from '../../hooks/useOnboardingSteps';

const classes: Record<OnboardingFiltersLayout, string> = {
  grid: 'tablet:grid-cols-3 grid-cols-2',
  list: 'grid-cols-1',
};

function FilterOnboarding({ onClose }: OnboardingStepProps): ReactElement {
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const [selectedTopics, setSelectedTopics] = useState({});
  const { onboardingFiltersLayout, onboardingMinimumTopics } =
    useContext(FeaturesContext);
  const { tagsCategories } = useFeedSettings();
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.TagsFilter,
  });
  const { onStepBackward, onStepForward, index } = useOnboardingSteps(
    OnboardingStep.Topics,
    onClose,
  );

  const onChangeSelectedTopic = (e: ButtonEvent, value: string) => {
    const isFollowed = !selectedTopics[value];
    const tagCommand = isFollowed ? onFollowTags : onUnfollowTags;
    const { tags, title } = tagsCategories.find(({ id }) => id === value);
    tagCommand({ tags, category: title });
    const result = { ...selectedTopics, [value]: isFollowed };
    setSelectedTopics(result);
    e.currentTarget.blur();
    if (invalidMessage) {
      setInvalidMessage(null);
    }
  };

  const onFilterNext = (e: MouseEvent, nextStep: MouseEventHandler) => {
    const topics = selectedTopics;
    const selected = Object.values(topics).filter((value) => !!value);
    const isValid = selected.length >= onboardingMinimumTopics;

    if (isValid) {
      return nextStep(e);
    }

    const topic = `topic${onboardingMinimumTopics > 1 ? 's' : ''}`;
    const message = `Choose at least ${onboardingMinimumTopics} ${topic} to follow`;
    setInvalidMessage(isValid ? null : message);

    return null;
  };

  return (
    <Modal.StepsWrapper view={OnboardingStep.Topics}>
      {({ previousStep, nextStep }) => (
        <>
          <Container
            title="Choose topics to follow"
            description="Pick topics you are interested in. You can always change these later."
            className={{
              container: 'px-0 pb-0',
              content:
                'p-4 mt-1 mb-4 flex flex-row justify-center overflow-x-hidden',
            }}
          >
            <div
              className={classNames(
                'grid gap-4 w-fit tablet:w-full',
                classes[onboardingFiltersLayout],
              )}
            >
              {tagsCategories?.map((category) => (
                <FeedTopicCard
                  key={category.title}
                  topic={category}
                  isActive={selectedTopics[category.id]}
                  topicLayout={onboardingFiltersLayout}
                  onClick={(e) => onChangeSelectedTopic(e, category.id)}
                />
              ))}
            </div>
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button
              className="btn-tertiary"
              onClick={onStepBackward(previousStep)}
            >
              {index === 1 ? 'Close' : 'Back'}
            </Button>
            <SimpleTooltip
              forceLoad
              content={invalidMessage}
              visible={!!invalidMessage}
              container={{
                className: 'w-36 text-center',
                paddingClassName: 'py-4 px-3',
              }}
            >
              <Button
                className="bg-theme-color-cabbage"
                onClick={(e) => onFilterNext(e, onStepForward(nextStep))}
              >
                Next
              </Button>
            </SimpleTooltip>
          </Modal.Footer>
        </>
      )}
    </Modal.StepsWrapper>
  );
}

export default FilterOnboarding;
