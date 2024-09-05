import React, { ReactElement, useMemo, useState } from 'react';
import { Radio } from '../../fields/Radio';
import { SquadSettingsSection } from './SquadSettingsSection';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { SquadCategoryDropdown } from './SquadCategoryDropdown';

interface CategoryDropdownProps {
  initialCategory: string;
  isPublic: boolean;
  categoryHint?: string;
  onCategoryChange?: (category: string) => void;
}

const classes = {
  wrapper: 'w-full',
  content: 'w-fit',
};

export enum PrivacyOption {
  Private = 'private',
  Public = 'public',
}

export function SquadPrivacySection({
  initialCategory,
  isPublic = true,
  categoryHint,
  onCategoryChange,
}: CategoryDropdownProps): ReactElement {
  const [privacy, setPrivacy] = useState(
    isPublic ? PrivacyOption.Public : PrivacyOption.Private,
  );
  const isPrivate = privacy === PrivacyOption.Private;

  const privacyOptions = useMemo(() => {
    return [
      {
        label: 'Public',
        value: PrivacyOption.Public,
        className: classes,
        afterElement: (
          <SquadCategoryDropdown
            isDisabled={isPrivate}
            initialCategory={initialCategory}
            categoryHint={categoryHint}
            onCategoryChange={onCategoryChange}
          />
        ),
      },
      {
        label: 'Private',
        value: PrivacyOption.Private,
        className: classes,
        afterElement: (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="ml-9"
          >
            Squad is invite-only, hidden from the directory, and perfect for
            teams and smaller groups of people who know each other and want to
            collaborate privately.
          </Typography>
        ),
      },
    ];
  }, [isPrivate, initialCategory, categoryHint, onCategoryChange]);

  return (
    <SquadSettingsSection title="Squad type" className="w-full">
      <Radio
        name="status"
        options={privacyOptions}
        value={privacy}
        className={{ container: 'mt-3 gap-4' }}
        onChange={(value) => setPrivacy(value)}
      />
    </SquadSettingsSection>
  );
}
