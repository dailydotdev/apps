import React, { ReactElement, useState, useContext } from 'react';
import classnames from 'classnames';
import { format } from 'date-fns';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import {
  StyledModal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/StyledModal';
import { getDefaultLink, dndOption, CustomTime, TimeFormat } from './dnd';
import DndContext from './DndContext';

const timeFormatOptions = Object.entries(dndOption).map(([k, v]) => ({
  label: v.label,
  value: k,
}));
const customTimeOptions = Object.values(CustomTime);

export default function DndModal({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  const { dndSettings, onDndSettings, isActive } = useContext(DndContext);
  const [link, setLink] = useState<string>(null);
  const [customNumber, setCustomNumber] = useState(0);
  const [customTimeIndex, setCustomTimeIndex] = useState(0);
  const [dndTime, setDndTime] = useState<TimeFormat>('HALF_HOUR');

  const handleSubmit = async (e: React.MouseEvent<Element, MouseEvent>) => {
    const option = dndOption[dndTime];
    const customTime = customTimeOptions[customTimeIndex];
    const expiration = option.getExpiration(customTime, customNumber);
    const fallback = link || getDefaultLink();

    await onDndSettings({ expiration, link: fallback });
    onRequestClose(e);
  };

  const turnedOnContent = (
    <div className="grid grid-cols-2 gap-6 justify-center my-6">
      <Button
        className="btn-secondary"
        buttonSize="large"
        onClick={onRequestClose}
      >
        Keep paused
      </Button>
      <Button
        className="btn-primary-onion"
        buttonSize="large"
        onClick={() => onDndSettings(null)}
      >
        Unpause now
      </Button>
    </div>
  );

  const turnedOffContent = (
    <>
      <div className="py-4 px-10 mt-2 w-full">
        <TextField
          inputId="defaultURL"
          label="Default URL (optional)"
          valueChanged={(text) => setLink(text)}
        />
        <Radio
          className="mt-8"
          name="timeOff"
          value={dndTime}
          options={timeFormatOptions}
          onChange={(value: TimeFormat) => setDndTime(value)}
        />
        {dndTime !== 'CUSTOM' ? null : (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <TextField
              className="w-40"
              inputId="defaultURL"
              label="Number"
              type="number"
              valueChanged={(number) => setCustomNumber(parseInt(number, 10))}
            />
            <Dropdown
              className="w-40"
              options={customTimeOptions}
              selectedIndex={customTimeIndex}
              onChange={(_, index) => setCustomTimeIndex(index)}
            />
          </div>
        )}
      </div>
      <div className="flex flex-row justify-center py-5 w-full border-t border-theme-divider-secondary">
        <Button
          className="w-40 btn-primary"
          buttonSize="large"
          onClick={handleSubmit}
        >
          Done
        </Button>
      </div>
    </>
  );

  const getDescription = () => {
    if (!isActive)
      return 'Choose the URL to temporarily show instead of daily.dev and the pause duration.';

    const date = format(dndSettings.expiration, 'MM/dd/yy');
    const time = format(dndSettings.expiration, 'hh:mm a');

    return `daily.dev in a new tab is paused, it will resume on ${date} at ${time}`;
  };

  const titleSize = isActive ? 'typo-title3' : 'typo-title2';

  return (
    <StyledModal
      {...modalProps}
      style={{
        content: {
          paddingTop: '2rem',
          maxWidth: '27.5rem',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {!isActive && <ModalCloseButton onClick={onRequestClose} />}
      <div className="px-16 text-center">
        <h3
          className={classnames(
            'font-bold text-theme-label-primary',
            titleSize,
          )}
        >
          Pause new tab
        </h3>
        <p className="mt-1 typo-callout text-theme-label-secondary">
          {getDescription()}
        </p>
      </div>
      {isActive ? turnedOnContent : turnedOffContent}
    </StyledModal>
  );
}
