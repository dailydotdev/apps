import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import PlusIcon from '../Plus';

const Primary = () => (
  <div className="rounded-6 bg-theme-overlay-cabbage">
    <PlusIcon className="text-theme-status-cabbage" />
  </div>
);

const Secondary = () => (
  <div className="rounded-6 bg-theme-status-cabbage">
    <PlusIcon className="text-theme-label-invert" />
  </div>
);

const SquadIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Primary} IconSecondary={Secondary} />
);

export default SquadIcon;
