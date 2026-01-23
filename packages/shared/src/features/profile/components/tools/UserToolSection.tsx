import type { ReactElement } from 'react';
import React from 'react';
import type { UserTool } from '../../../../graphql/user/userTool';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { Pill, PillSize } from '../../../../components/Pill';
import { UserToolItem } from './UserToolItem';

interface UserToolSectionProps {
  category: string;
  items: UserTool[];
  isOwner: boolean;
  onEdit?: (item: UserTool) => void;
  onDelete?: (item: UserTool) => void;
}

export function UserToolSection({
  category,
  items,
  isOwner,
  onEdit,
  onDelete,
}: UserToolSectionProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          bold
        >
          {category}
        </Typography>
        <Pill
          label={String(items.length)}
          size={PillSize.Small}
          className="border border-border-subtlest-tertiary text-text-quaternary"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <UserToolItem
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
