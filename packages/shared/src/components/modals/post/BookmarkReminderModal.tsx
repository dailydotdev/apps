import type { FormEventHandler, ReactElement } from 'react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import type { LazyModalCommonProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { ModalBody } from '../common/ModalBody';
import { ModalSize } from '../common/types';
import { Button, ButtonVariant } from '../../buttons/Button';
import {
  getRemindAt,
  ReminderPreference,
  useBookmarkReminder,
} from '../../../hooks/notifications';
import type { Post } from '../../../graphql/posts';
import type { ActiveFeedContextValue } from '../../../contexts';
import { ActiveFeedContext } from '../../../contexts';
import ConditionalWrapper from '../../ConditionalWrapper';

export interface BookmarkReminderProps extends LazyModalCommonProps {
  onReminderSet?: (reminder: string) => void;
  feedContextData?: ActiveFeedContextValue;
  post: Post;
}

interface BookmarkReminderModalOptionProps {
  isActive: boolean;
  onClick: () => void;
  option: {
    key: keyof typeof ReminderPreference;
    value: ReminderPreference;
  };
}

const MODAL_OPTION_ORDER: ReminderPreference[] = [
  ReminderPreference.OneHour,
  ReminderPreference.Tomorrow,
  ReminderPreference.TwoDays,
  ReminderPreference.NextWeek,
];

const MODAL_OPTIONS: Array<BookmarkReminderModalOptionProps['option']> =
  MODAL_OPTION_ORDER.filter((option) => {
    const now = new Date();
    const isPastLaterToday = now.getHours() >= 19;
    const isInvalidLaterToday =
      ReminderPreference.LaterToday === option && isPastLaterToday;
    return !isInvalidLaterToday;
  }).map((value) => ({
    key: value,
    value,
  }));

const TIME_FOR_OPTION_FORMAT_MAP = {
  [ReminderPreference.OneHour]: 'eee, h:mm a',
  [ReminderPreference.LaterToday]: null,
  [ReminderPreference.Tomorrow]: 'eee, h:mm a',
  [ReminderPreference.TwoDays]: 'eee, h:mm a',
  [ReminderPreference.NextWeek]: 'eee, MMM d, h:mm a',
};

const BookmarkReminderModalOption = (
  props: BookmarkReminderModalOptionProps,
) => {
  const { option, onClick, isActive } = props;
  const { value } = option;

  const now = new Date();
  const timeFormat = TIME_FOR_OPTION_FORMAT_MAP[value];
  const timeForOption =
    timeFormat && format(getRemindAt(now, value), timeFormat);

  return (
    <Button
      aria-checked={isActive}
      aria-label={value}
      className="w-full"
      name="bookmarkReminder"
      onClick={onClick}
      role="radio"
      type="button"
      value={value}
      variant={isActive ? ButtonVariant.Float : ButtonVariant.Option}
    >
      <span className="flex-1 text-left">
        {value}
        {timeForOption && (
          <span className="text-text-quaternary"> ({timeForOption})</span>
        )}
      </span>
    </Button>
  );
};

export const BookmarkReminderModal = (
  props: BookmarkReminderProps,
): ReactElement => {
  const { post, onReminderSet, isOpen, onRequestClose } = props;
  const [selectedOption, setSelectedOption] = useState<ReminderPreference>(
    ReminderPreference.NextWeek,
  );
  const { onBookmarkReminder } = useBookmarkReminder({ post });

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    onReminderSet?.(selectedOption);
    onBookmarkReminder({
      existingReminder: post.bookmark?.remindAt,
      postId: post.id,
      preference: selectedOption,
    }).then(() => {
      onRequestClose(null);
    });
  };

  return (
    <Modal
      drawerProps={{
        title: 'Set a reminder',
        className: {
          title: '!block text-center border-transparent !typo-title2 pb-2',
        },
      }}
      isDrawerOnMobile={isOpen}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
    >
      <ModalHeader title="Set a reminder" />
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div
            role="radiogroup"
            aria-required
            aria-label="Reminder time options"
            tabIndex={0}
          >
            {MODAL_OPTIONS.map((option) => (
              <BookmarkReminderModalOption
                key={option.key}
                onClick={() => setSelectedOption(option.value)}
                isActive={selectedOption === option.value}
                option={option}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-row justify-center">
            <Button
              className="w-full responsiveModalBreakpoint:w-auto"
              variant={ButtonVariant.Primary}
            >
              Set reminder
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

const ModalComponent: typeof BookmarkReminderModal = ({
  feedContextData,
  ...props
}) => (
  <ConditionalWrapper
    condition={!!feedContextData}
    wrapper={(component) => (
      <ActiveFeedContext.Provider value={feedContextData}>
        {component}
      </ActiveFeedContext.Provider>
    )}
  >
    <BookmarkReminderModal {...props} />
  </ConditionalWrapper>
);

export default ModalComponent;
