import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalSize } from '@dailydotdev/shared/src/components/modals/common/types';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import type { HelperProfile } from '../data';
import { me, myTopReadTags } from '../data';
import { useProto } from '../store';
import { SectionLabel } from '../ui';
import { allZones, ReputationFilter, TimeZoneFilter } from '../filters';

const perMonthOptions = [1, 2, 4];

export const HelperModal = ({
  onClose,
  prefill,
}: {
  onClose: () => void;
  // The board's filters, from its Help tab.
  prefill?: Partial<HelperProfile>;
}): ReactElement => {
  const { state, setHelper, showToast } = useProto();
  const current = { ...state.helpers[me.id], ...prefill };
  const [tags, setTags] = useState<string[]>(current.tags ?? myTopReadTags);
  const [timezones, setTimezones] = useState(current.timezones ?? []);
  const [minReputation, setMinReputation] = useState(
    current.minReputation ?? 0,
  );
  const [perMonth, setPerMonth] = useState(current.perMonth ?? 2);
  const isOn = !!state.helpers[me.id];
  const canSave = tags.length > 0;

  return (
    <Modal
      isOpen
      isDrawerOnMobile
      size={ModalSize.Small}
      onRequestClose={onClose}
    >
      <Modal.Header title="Open to helping" />
      <Modal.Body className="flex flex-col gap-5">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          You&apos;ll get a heads-up when someone asks for help with something
          you know. It&apos;s unpaid, and you always pick who to answer.
        </Typography>

        <div className="flex flex-col gap-2">
          <SectionLabel>Topics</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<MiniCloseIcon />}
                iconPosition={ButtonIconPosition.Right}
                aria-label={`Remove #${tag}`}
                onClick={() =>
                  setTags((prev) => prev.filter((value) => value !== tag))
                }
              >
                #{tag}
              </Button>
            ))}
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {prefill?.tags
              ? "From your filters on the board. Remove any you'd rather not hear about."
              : "Picked from what you read most. Remove any you'd rather not hear about."}
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Who you hear from</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <TimeZoneFilter
              zones={allZones}
              value={timezones}
              onChange={setTimezones}
              placeholder="Any time zone"
            />
            <ReputationFilter
              value={minReputation}
              onChange={setMinReputation}
              placeholder="Any reputation"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>How often</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {perMonthOptions.map((value) => (
              <Button
                key={value}
                type="button"
                variant={
                  perMonth === value
                    ? ButtonVariant.Primary
                    : ButtonVariant.Float
                }
                size={ButtonSize.Small}
                aria-pressed={perMonth === value}
                onClick={() => setPerMonth(value)}
              >
                {value === 1 ? 'Once a month' : `Up to ${value} a month`}
              </Button>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isOn ? (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={() => {
              setHelper(undefined);
              onClose();
            }}
          >
            Turn off
          </Button>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          disabled={!canSave}
          onClick={() => {
            setHelper({ tags, perMonth, timezones, minReputation });
            showToast(
              "You're open to helping. You'll get a heads-up when a request matches.",
            );
            onClose();
          }}
        >
          {isOn ? 'Save' : 'Turn on'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
