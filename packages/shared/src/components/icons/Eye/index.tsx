import React from 'react';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

type Props = {
  filled?: boolean;
};

const EyeIcon: React.VFC<Props> = ({ filled = false }) => (
  <Icon filled={filled} IconOutlined={OutlinedIcon} IconFilled={FilledIcon} />
);

export default EyeIcon;
