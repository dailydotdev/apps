import type { ReactElement } from 'react';
import React from 'react';
import type { UserStack } from '../../../../graphql/user/userStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { Pill, PillSize } from '../../../../components/Pill';
import { UserStackItem } from './UserStackItem';

interface UserStackSectionProps {
  section: string;
  items: UserStack[];
  isOwner: boolean;
  onEdit?: (item: UserStack) => void;
  onDelete?: (item: UserStack) => void;
}

export function UserStackSection({
  section,
  items,
  isOwner,
  onEdit,
  onDelete,
}: UserStackSectionProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          bold
        >
          {section}
        </Typography>
        <Pill
          label={String(items.length)}
          size={PillSize.Small}
          className="border border-border-subtlest-tertiary text-text-quaternary"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <UserStackItem
            key={item.id}
            item={item}
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
