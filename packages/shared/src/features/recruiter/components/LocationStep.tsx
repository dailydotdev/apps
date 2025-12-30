import React from 'react';
import type { ReactElement } from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import Autocomplete from '../../../components/fields/Autocomplete';
import { locationToString } from '../../../lib/utils';
import { ProgressStep } from '../../opportunity/components/ProgressStep';

export const LocationStep = ({
  currentStep,
  totalSteps,
  defaultLocation,
  locationOptions,
  selectedLocationId,
  isLoadingLocations,
  onLocationQueryChange,
  onLocationSelect,
}: {
  currentStep: number;
  totalSteps: number;
  defaultLocation?: { city?: string; country: string };
  locationOptions: Array<{ label: string; value: string }>;
  selectedLocationId: string;
  isLoadingLocations: boolean;
  onLocationQueryChange: (value: string) => void;
  onLocationSelect: (value: string) => void;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Is this still right?
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          Make sure your location is up to date for the best opportunities
        </Typography>
      </FlexCol>
      <FlexCol className="gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <Autocomplete
          name="location"
          label="Location"
          placeholder="Search for a city or country"
          defaultValue={
            defaultLocation ? locationToString(defaultLocation) : ''
          }
          options={locationOptions}
          selectedValue={selectedLocationId}
          onChange={onLocationQueryChange}
          onSelect={onLocationSelect}
          isLoading={isLoadingLocations}
          resetOnBlur
        />
      </FlexCol>
    </>
  );
};
