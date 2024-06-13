import React, { ReactElement, useState } from 'react';
import { format } from 'date-fns';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import {
  Modal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/common/Modal';
import { Justify } from '@dailydotdev/shared/src/components/utilities';
import { useDndContext } from '@dailydotdev/shared/src/contexts/DndContext';
import { getDefaultLink, dndOption, CustomTime, TimeFormat } from './dnd';

const timeFormatOptions = Object.entries(dndOption).map(([k, v]) => ({
  label: v.label,
  value: k,
}));
const customTimeOptions = Object.values(CustomTime);

export default function DndModal({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  const { dndSettings, onDndSettings, isActive } = useDndContext();
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

  const getDescription = () => {
    if (!isActive) {
      return 'Choose the URL to temporarily show instead of daily.dev and the pause duration.';
    }

    const date = format(dndSettings.expiration, 'MM/dd/yy');
    const time = format(dndSettings.expiration, 'hh:mm a');

    return `daily.dev in a new tab is paused, it will resume on ${date} at ${time}`;
  };

  return (
    <Modal
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
      {...modalProps}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title="Pause new tab" />
      <Modal.Body>
        <p className="text-text-secondary typo-callout">{getDescription()}</p>
        {!isActive && (
          <div className="mt-6">
            <TextField
              inputId="defaultURL"
              label="Default URL (optional)"
              valueChanged={(text) => setLink(text)}
            />
            <Radio
              className={{ container: 'mt-8' }}
              name="timeOff"
              value={dndTime}
              options={timeFormatOptions}
              onChange={(value: TimeFormat) => setDndTime(value)}
            />
            {dndTime !== 'CUSTOM' ? null : (
              <div className="mt-4 flex flex-row gap-4">
                <TextField
                  className={{ container: 'w-40' }}
                  inputId="defaultURL"
                  label="Number"
                  type="number"
                  valueChanged={(number) =>
                    setCustomNumber(parseInt(number, 10))
                  }
                />
                <Dropdown
                  className={{ container: 'w-40' }}
                  options={customTimeOptions}
                  selectedIndex={customTimeIndex}
                  onChange={(_, index) => setCustomTimeIndex(index)}
                />
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer justify={!isActive ? Justify.End : Justify.Between}>
        {isActive ? (
          <>
            <Button variant={ButtonVariant.Secondary} onClick={onRequestClose}>
              Keep paused
            </Button>
            <Button
              variant={ButtonVariant.Primary}
              onClick={() => onDndSettings(null)}
            >
              Unpause now
            </Button>
          </>
        ) : (
          <Button variant={ButtonVariant.Primary} onClick={handleSubmit}>
            Done
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
