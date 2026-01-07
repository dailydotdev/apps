import React, { useState } from 'react';
import { TextField } from '../../../components/fields/TextField';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { PlusIcon } from '../../../components/icons';
import { TagElement } from '../../../components/feeds/FeedSettings/TagElement';

export type PerkInputProps = {
  perks: string[];
  onAdd: (perks: string | string[]) => void;
  onRemove: (perk: string) => void;
};

export const PerkInput = ({ perks, onAdd, onRemove }: PerkInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddPerks = () => {
    const newPerks = inputValue
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => !perks.includes(p)); // exclude already-added perks

    if (newPerks.length === 0) {
      if (inputValue) {
        setInputValue('');
      }
      return;
    }

    // Pass all new perks at once
    onAdd(newPerks);
    setInputValue('');
  };

  return (
    <div className="flex flex-col gap-4">
      <TextField
        type="text"
        inputId="perkInput"
        label="Company perks"
        placeholder="e.g., Remote work, Health insurance"
        hint="Separate with commas, press Enter to add"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddPerks();
          }
        }}
        fieldType="secondary"
        actionButton={
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            icon={<PlusIcon />}
            onClick={handleAddPerks}
          >
            Add
          </Button>
        }
      />

      {perks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {perks.map((perk) => (
            <TagElement
              key={perk}
              tag={{ name: perk }}
              isSelected
              onClick={() => onRemove(perk)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
