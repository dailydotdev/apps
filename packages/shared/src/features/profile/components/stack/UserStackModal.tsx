import type { FormEvent, ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { TextField } from '../../../../components/fields/TextField';
import {
  Typography,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import { ModalHeader } from '../../../../components/modals/common/ModalHeader';
import { useViewSize, ViewSize } from '../../../../hooks';
import type {
  UserStack,
  AddUserStackInput,
  DatasetStack,
} from '../../../../graphql/user/userStack';
import { useStackSearch } from '../../hooks/useStackSearch';
import { EmojiPicker } from '../../../../components/fields/EmojiPicker';
import YearSelect from '../../../../components/profile/YearSelect';
import MonthSelect from '../../../../components/profile/MonthSelect';

// Common section options
const SECTION_OPTIONS = ['Primary', 'Hobby', 'Learning', 'Past'];

type UserStackModalProps = Omit<ModalProps, 'children'> & {
  onSubmit: (input: AddUserStackInput) => Promise<void>;
  existingItem?: UserStack;
};

export function UserStackModal({
  onSubmit,
  existingItem,
  ...rest
}: UserStackModalProps): ReactElement {
  // Use user's title if set, otherwise fall back to dataset title
  const [title, setTitle] = useState(
    existingItem?.title ?? existingItem?.stack.title ?? '',
  );
  const [section, setSection] = useState(existingItem?.section || 'Primary');
  const [customSection, setCustomSection] = useState('');
  // Use user's icon if set, otherwise fall back to dataset icon
  const [icon, setIcon] = useState(
    existingItem?.icon ?? existingItem?.stack.icon ?? '',
  );
  const [startedAtYear, setStartedAtYear] = useState(() => {
    if (existingItem?.startedAt) {
      return new Date(existingItem.startedAt).getUTCFullYear().toString();
    }
    return '';
  });
  const [startedAtMonth, setStartedAtMonth] = useState(() => {
    if (existingItem?.startedAt) {
      return new Date(existingItem.startedAt).getUTCMonth().toString();
    }
    return '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isMobile = useViewSize(ViewSize.MobileL);
  const isEditing = !!existingItem;

  const { results: suggestions } = useStackSearch(title);

  const isCustomSection = !SECTION_OPTIONS.includes(section);
  const finalSection = isCustomSection ? customSection || section : section;

  const canSubmit = title.trim().length > 0 && finalSection.trim().length > 0;

  const handleSelectSuggestion = (suggestion: DatasetStack) => {
    setTitle(suggestion.title);
    if (suggestion.icon) {
      setIcon(suggestion.icon);
    }
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      let startedAtValue: string | undefined;
      if (startedAtYear) {
        const year = parseInt(startedAtYear, 10);
        const month = startedAtMonth ? parseInt(startedAtMonth, 10) : 0;
        const date = new Date(Date.UTC(year, month, 1, 12, 0, 0, 0));
        startedAtValue = date.toISOString();
      }

      await onSubmit({
        title: title.trim(),
        section: finalSection.trim(),
        icon: icon || undefined,
        startedAt: startedAtValue,
      });
      rest.onRequestClose?.(e as unknown as React.MouseEvent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!showSuggestions || title.length < 1) {
      return [];
    }
    return suggestions.filter(
      (s) => s.title.toLowerCase() !== title.toLowerCase(),
    );
  }, [suggestions, showSuggestions, title]);

  return (
    <Modal
      formProps={{
        form: 'user_stack_form',
        title: (
          <div className="px-4">
            <ModalHeader.Title className="typo-title3">
              {isEditing ? 'Edit Stack Item' : 'Add to Stack'}
            </ModalHeader.Title>
          </div>
        ),
        rightButtonProps: {
          variant: ButtonVariant.Primary,
          disabled: !canSubmit || isSubmitting,
          loading: isSubmitting,
        },
        copy: { right: isEditing ? 'Save' : 'Add' },
      }}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      {...rest}
    >
      <form onSubmit={handleSubmit} id="user_stack_form">
        <ModalHeader showCloseButton={!isMobile}>
          <ModalHeader.Title className="typo-title3">
            {isEditing ? 'Edit Stack Item' : 'Add to Stack'}
          </ModalHeader.Title>
        </ModalHeader>
        <Modal.Body className="flex flex-col gap-4">
          {/* Title with autocomplete (only when adding new) */}
          <div className="relative">
            <TextField
              autoComplete="off"
              autoFocus
              inputId="stackTitle"
              label="Technology or skill"
              maxLength={255}
              name="title"
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEditing) {
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => {
                if (!isEditing) {
                  setShowSuggestions(true);
                }
              }}
              value={title}
            />
            {!isEditing && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-1 mt-1 max-h-48 overflow-auto rounded-12 border border-border-subtlest-tertiary bg-background-default shadow-2">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-surface-hover"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion.icon && <span>{suggestion.icon}</span>}
                    <span className="typo-callout">{suggestion.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section selector */}
          <div className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Callout}>
              Section
            </Typography>
            <div className="flex flex-wrap gap-2">
              {SECTION_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant={
                    section === opt
                      ? ButtonVariant.Primary
                      : ButtonVariant.Float
                  }
                  onClick={() => {
                    setSection(opt);
                    setCustomSection('');
                  }}
                >
                  {opt}
                </Button>
              ))}
              <Button
                type="button"
                variant={
                  isCustomSection ? ButtonVariant.Primary : ButtonVariant.Float
                }
                onClick={() => setSection('custom')}
              >
                Custom
              </Button>
            </div>
            {isCustomSection && (
              <TextField
                autoComplete="off"
                inputId="customSection"
                label="Custom section name"
                maxLength={100}
                name="customSection"
                onChange={(e) => setCustomSection(e.target.value)}
                value={customSection}
              />
            )}
          </div>

          {/* Icon picker */}
          <EmojiPicker value={icon} onChange={setIcon} />

          {/* Started at - separate year and month */}
          <div className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Callout}>
              Using since (optional)
            </Typography>
            <div className="flex gap-4">
              <div className="flex-1">
                <YearSelect
                  name="startedAtYear"
                  placeholder="Year"
                  onSelect={setStartedAtYear}
                  value={startedAtYear}
                />
              </div>
              <div className="flex-1">
                <MonthSelect
                  name="startedAtMonth"
                  placeholder="Month"
                  onSelect={setStartedAtMonth}
                  value={startedAtMonth}
                  disabled={!startedAtYear}
                />
              </div>
            </div>
          </div>

          {!isMobile && (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              loading={isSubmitting}
              variant={ButtonVariant.Primary}
            >
              {isEditing ? 'Save changes' : 'Add to stack'}
            </Button>
          )}
        </Modal.Body>
      </form>
    </Modal>
  );
}
