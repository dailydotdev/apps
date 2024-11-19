import React, { ReactElement } from 'react';
import { ChecklistAIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';

const PlusItem = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2">
      <ChecklistAIcon className="text-text-quaternary" size={IconSize.Small} />
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
      >
        {title}
      </Typography>
    </li>
  );
};

export const PlusList = (): ReactElement => {
  return (
    <ul className="flex flex-col gap-2 py-6">
      <PlusItem title="Ads-free browsing" />
      <PlusItem title="Exclusive Plus badge" />
      <PlusItem title="Private squad for Plus members" />
      <PlusItem title="Support the team and make us smile" />
      <PlusItem title="And so much more coming soon..." />
    </ul>
  );
};
