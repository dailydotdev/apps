import React, { FC, useState, useContext } from 'react';
import { format } from 'date-fns';
import { getDefaultLink, dndOption, CustomTime, TimeFormat } from './dnd';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import {
  StyledModal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/StyledModal';
import DndContext from './DndContext';

const timeFormatOptions = Object.entries(dndOption).map(([k, v]) => ({
  label: v.label,
  value: k,
}));
const customTimeOptions = Object.values(CustomTime);

const DoNotDisturbModal: FC<ModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { dndSettings, setDndSettings, isActive } = useContext(DndContext);
  const [link, setLink] = useState('');
  const [customNumber, setCustomNumber] = useState(0);
  const [customTimeIndex, setCustomTimeIndex] = useState(0);
  const [dndTime, setDndTime] = useState<TimeFormat>('HALF_HOUR');

  const handleSubmit = async (e: React.MouseEvent<Element, MouseEvent>) => {
    const option = dndOption[dndTime];
    const customTime = customTimeOptions[customTimeIndex];
    const expiration = option.getExpiration(customTime, customNumber);
    const fallback = link || getDefaultLink();

    await setDndSettings({ expiration, link: fallback });

    onRequestClose(e);
  };

  const turnedOnContent = (
    <div className="grid grid-cols-2 gap-6 justify-center my-6">
      <button
        onClick={onRequestClose}
        className="flex justify-center items-center w-28 h-12 rounded-xl border border-white text-base text-white font-bold"
      >
        Cancel
      </button>
      <button
        onClick={() => setDndSettings(null)}
        className="flex justify-center items-center w-28 h-12 rounded-xl text-base text-white font-bold bg-onion-40"
      >
        Turn Off
      </button>
    </div>
  );

  const turnedOffContent = (
    <div className="w-full mt-2 py-4 px-10">
      <TextField
        inputId="defaultURL"
        label="Default URL (optional)"
        valueChanged={(text) => setLink(text)}
      />
      <Radio
        className="mt-8 "
        name="timeOff"
        value={dndTime}
        options={timeFormatOptions}
        onChange={(value: TimeFormat) => setDndTime(value)}
      />
      {dndTime !== 'CUSTOM' ? null : (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <TextField
            className="w-40 appearance-none"
            inputId="defaultURL"
            label="Number"
            type="number"
            valueChanged={(number) => setCustomNumber(parseInt(number))}
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
  );

  const getDescription = () => {
    if (!isActive)
      return "Choose your preferences while you're on Do Not Disturb mode";

    const date = format(dndSettings.expiration, 'MM/dd/yy');
    const time = format(dndSettings.expiration, 'hh:mm a');

    return `Do Not Disturb is active and will be turned off on ${date} at ${time}`;
  };

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
      <ModalCloseButton onClick={onRequestClose} />
      <div className="px-16 text-center">
        <h3 className="font-bold text-2xl text-white">Do Not Disturb</h3>
        <p className="mt-1 text-sm text-salt-50">{getDescription()}</p>
      </div>
      {isActive ? turnedOnContent : turnedOffContent}
      {isActive ? null : (
        <div className="flex flex-row justify-center items-center w-full py-5 border-t border-salt-90 border-opacity-40">
          <button
            className="flex flex-row justify-center items-center w-40 h-10 rounded-xl py-5 font-bold text-sm text-pepper-90 bg-white"
            onClick={handleSubmit}
          >
            Done
          </button>
        </div>
      )}
    </StyledModal>
  );
};

export default DoNotDisturbModal;
