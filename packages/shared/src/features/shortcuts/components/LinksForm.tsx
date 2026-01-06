import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { TextField } from '../../../components/fields/TextField';
import { useShortcutLinks } from '../hooks/useShortcutLinks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const limit = 8;
const list = Array(limit).fill(0);

interface SortableTextFieldProps {
  index: number;
  value: string;
  isFormReadonly: boolean;
  validInputs: Record<number, boolean>;
  onChange: (i: number, isValid: boolean) => void;
}

function SortableTextField({
  index,
  value,
  isFormReadonly,
  validInputs,
  onChange,
}: SortableTextFieldProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `shortcutLink-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TextField
        name="shortcutLink"
        inputId={`shortcutLink-${index}`}
        type="url"
        autoComplete="off"
        fieldType="tertiary"
        label="Add shortcuts"
        value={value}
        valid={validInputs[index] !== false}
        hint={validInputs[index] === false && 'Must be a valid HTTP/S link'}
        readOnly={isFormReadonly}
        validityChanged={(isValid) => onChange(index, isValid)}
        placeholder="http://example.com"
        className={{
          input: isFormReadonly ? '!text-text-quaternary' : undefined,
        }}
      />
    </div>
  );
}

export function LinksForm(): ReactElement {
  const { formLinks = [], isManual } = useShortcutLinks();
  const [validInputs, setValidInputs] = useState({});
  const [orderedLinks, setOrderedLinks] = useState<string[]>(formLinks);
  const isFormReadonly = isManual === false;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onChange = (i: number, isValid: boolean) => {
    if (validInputs[i] === isValid) {
      return;
    }

    setValidInputs((state) => ({ ...state, [i]: isValid }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || isFormReadonly) {
      return;
    }

    const activeIndex = parseInt(
      (active.id as string).replace('shortcutLink-', ''),
      10,
    );
    const overIndex = parseInt(
      (over.id as string).replace('shortcutLink-', ''),
      10,
    );

    setOrderedLinks((items) => arrayMove(items, activeIndex, overIndex));
  };

  const displayLinks = orderedLinks.length > 0 ? orderedLinks : formLinks;

  if (!isFormReadonly && isManual) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={list.map((_, i) => `shortcutLink-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {list.map((_, i) => (
              <SortableTextField
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                index={i}
                value={displayLinks[i]}
                isFormReadonly={isFormReadonly}
                validInputs={validInputs}
                onChange={onChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {list.map((_, i) => (
        <TextField
          name="shortcutLink"
          inputId={`shortcutLink-${i}`}
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          type="url"
          autoComplete="off"
          fieldType="tertiary"
          label="Add shortcuts"
          value={displayLinks[i]}
          valid={validInputs[i] !== false}
          hint={validInputs[i] === false && 'Must be a valid HTTP/S link'}
          readOnly={isFormReadonly}
          validityChanged={(isValid) => onChange(i, isValid)}
          placeholder="http://example.com"
          className={{
            input: isFormReadonly ? '!text-text-quaternary' : undefined,
          }}
        />
      ))}
    </div>
  );
}
