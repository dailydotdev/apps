import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { Modal, ModalProps } from '../modals/common/Modal';
import { ModalHeader } from '../modals/common/ModalHeader';
import { ModalBody } from '../modals/common/ModalBody';
import { ModalSize } from '../modals/common/types';
import { Button, ButtonVariant } from '../buttons/Button';
import {
  getRemindAt,
  ReminderPreference,
} from '../../hooks/notifications/useBookmarkReminder';

export interface ReminderModalProps
  extends Pick<ModalProps, 'isOpen' | 'onRequestClose'> {
  onReminderSet: (reminder: string) => void;
}

interface ReminderModalOptionProps {
  isActive: boolean;
  onClick: () => void;
  option: {
    label: ReminderPreference;
    value: string;
  };
}

const MODAL_OPTIONS: Array<ReminderModalOptionProps['option']> = Object.entries(
  ReminderPreference,
).map(([value, label]) => ({
  value,
  label,
}));

const TIME_FOR_OPTION_FORMAT_MAP = {
  [ReminderPreference.OneHour]: null,
  [ReminderPreference.LaterToday]: 'h:mm a',
  [ReminderPreference.Tomorrow]: 'eee, h:mm a',
  [ReminderPreference.TwoDays]: 'eee, h:mm a',
  [ReminderPreference.NextWeek]: 'eee, MMM d, h:mm a',
};

const ReminderModalOption = (props: ReminderModalOptionProps) => {
  const { option, onClick, isActive } = props;
  const { label, value } = option;

  const now = new Date();
  const timeFormat = TIME_FOR_OPTION_FORMAT_MAP[label];
  const timeForOption =
    timeFormat && format(getRemindAt(now, label), timeFormat);

  return (
    <Button
      aria-checked={isActive}
      aria-label={label}
      className="w-full"
      name="bookmarkReminder"
      onClick={onClick}
      role="radio"
      type="button"
      value={value}
      variant={isActive ? ButtonVariant.Float : ButtonVariant.Option}
    >
      <span className={classNames('flex-1 text-left')}>
        {label}
        {timeForOption && (
          <span className="text-text-quaternary"> ({timeForOption})</span>
        )}
      </span>
    </Button>
  );
};

export const ReminderModal = (props: ReminderModalProps): ReactElement => {
  const { isOpen, onRequestClose, onReminderSet } = props;
  const defaultOption = 'OneHour';
  const [selectedOption, setSelectedOption] = useState<string>(defaultOption);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    onReminderSet(selectedOption);
  };

  return (
    <Modal
      drawerProps={{
        title: 'Set reminder',
        className: {
          title: '!block text-center border-transparent !typo-title2 pb-2',
        },
      }}
      isDrawerOnMobile={isOpen}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
    >
      <ModalHeader title="Set reminder" />
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div
            role="radiogroup"
            aria-required
            aria-label="Reminder time options"
            tabIndex={0}
          >
            {MODAL_OPTIONS.map((option) => (
              <ReminderModalOption
                key={option.value}
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

export default ReminderModal;
