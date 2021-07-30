import React, { FC, useState, useContext } from 'react';
import classnames from 'classnames';
import { getDefaultLink, dndOption, CustomTime, TimeFormat } from './dnd';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import {
  StyledModal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/StyledModal';
import styles from './DoNotDisturbModal.module.css';
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
  const { setDndSettings, isActive } = useContext(DndContext);
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

  const renderForm = () => {
    if (isActive) return <br />;

    return (
      <div className={styles.content}>
        <TextField
          className={styles.url}
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
              className={styles.custom}
              inputId="defaultURL"
              label="Number"
              type="number"
              valueChanged={(number) => setCustomNumber(parseInt(number))}
            />
            <Dropdown
              className={styles.custom}
              options={customTimeOptions}
              selectedIndex={customTimeIndex}
              onChange={(_, index) => setCustomTimeIndex(index)}
            />
          </div>
        )}
      </div>
    );
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
      <div className={styles.heading}>
        <h3 className={styles.title}>Do Not Disturb</h3>
        {isActive ? null : (
          <p className={styles.description}>
            Choose your preferences while you&apos;re on Do Not Disturb mode
          </p>
        )}
      </div>
      {renderForm()}
      <div className={classnames(styles.footer, styles.centered)}>
        <button
          className={classnames(styles.done, styles.centered)}
          onClick={(e) => (isActive ? setDndSettings(null) : handleSubmit(e))}
        >
          {isActive ? 'Turn off' : 'Done'}
        </button>
      </div>
    </StyledModal>
  );
};

export default DoNotDisturbModal;
