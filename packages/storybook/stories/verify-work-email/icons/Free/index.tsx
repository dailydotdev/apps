import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import Icon from '@dailydotdev/shared/src/components/Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

// A new icon in the library's format (24px, 1.5px lines, outlined and
// filled), kept with the proposal until it's approved. To ship it, move this
// folder to shared/src/components/icons/Free and export it from the index.
export const FreeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);
