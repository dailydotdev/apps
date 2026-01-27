import type { ReactElement } from 'react';
import React from 'react';
import type { SourceStack } from '../../../graphql/source/sourceStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { Pill, PillSize } from '../../Pill';
import { SourceStackItem } from './SourceStackItem';

interface SourceStackSectionProps {
  section: string;
  items: SourceStack[];
  canEdit: boolean;
  onEdit?: (item: SourceStack) => void;
  onDelete?: (item: SourceStack) => void;
}

export function SourceStackSection({
  section,
  items,
  canEdit,
  onEdit,
  onDelete,
}: SourceStackSectionProps): ReactElement {
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
          <SourceStackItem
            key={item.id}
            item={item}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
