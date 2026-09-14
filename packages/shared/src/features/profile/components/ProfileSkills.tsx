import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { PopoverContentProps } from '@radix-ui/react-popover';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { TextField } from '../../../components/fields/TextField';
import { FeedbackIcon, SearchIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { TagElement } from '../../../components/feeds/FeedSettings/TagElement';
import { PopoverContent } from '../../../components/popover/Popover';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { GenericLoaderSpinner } from '../../../components/utilities/loaders';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { getKeywordAutocompleteOptions } from '../../opportunity/queries';
import {
  userExperienceSkillMaxLength,
  userExperienceSkillsLimit,
} from '../common';
import { useToastNotification } from '../../../hooks/useToastNotification';

type ProfileSkillsProps = {
  name: string;
};

const defaultHint =
  'Add commas (,) to add multiple skills. Press Enter to submit them.';
const limitHint = `You can add up to ${userExperienceSkillsLimit} skills`;
const overflowHint = `${limitHint}. Some skills were not added.`;

const skillIdentity = (skill: string): string =>
  skill
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, userExperienceSkillMaxLength);

const getFieldErrorMessage = (error: unknown): string | undefined => {
  if (!error) {
    return undefined;
  }

  const fieldError = error as Partial<FieldError>;
  if (typeof fieldError.message === 'string') {
    return fieldError.message;
  }

  if (typeof error === 'object') {
    return Object.values(error as Record<string, unknown>)
      .map(getFieldErrorMessage)
      .find(Boolean);
  }

  return undefined;
};

const getPathValue = (value: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') {
      return undefined;
    }

    return (acc as Record<string, unknown>)[key];
  }, value);

const ProfileSkills = ({ name }: ProfileSkillsProps): ReactElement => {
  const { control, formState } = useFormContext();
  const { displayToast } = useToastNotification();
  const [query, setQuery] = useState<string>('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data: autocompleteKeywords, isFetching } = useQuery(
    getKeywordAutocompleteOptions(query),
  );
  const hasAutocompleteKeywords = (autocompleteKeywords?.length ?? 0) > 0;

  const [debouncedQuery, cancelDebouncedQuery] = useDebounceFn<string>(
    (data) => setQuery(data ?? ''),
    300,
  );

  const clearQuery = () => {
    cancelDebouncedQuery();
    setQuery('');
  };

  const handlePopoverClose: PopoverContentProps['onInteractOutside'] = (e) => {
    if (e.target === inputRef.current) {
      e.preventDefault();
      return;
    }

    setOpen(false);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const skills = Array.isArray(field.value) ? field.value : [];
        const isAtLimit = skills.length >= userExperienceSkillsLimit;
        const errorMessage = getFieldErrorMessage(
          fieldState.error ?? getPathValue(formState.errors, name),
        );
        const hint = errorMessage || (isAtLimit ? limitHint : defaultHint);
        const inputHint = errorMessage ? undefined : hint;
        const existingSkillIdentities = new Set(skills.map(skillIdentity));

        const addSkill = (skill: string) => {
          if (isAtLimit) {
            displayToast(limitHint);
            return;
          }

          if (existingSkillIdentities.has(skillIdentity(skill))) {
            return;
          }

          field.onChange([...skills, skill]);
        };

        const removeSkill = (skill: string) => {
          const identity = skillIdentity(skill);
          field.onChange(
            skills.filter((s: string) => skillIdentity(s) !== identity),
          );
        };

        return (
          <div className="flex flex-col gap-4">
            <Typography type={TypographyType.Callout} bold>
              Skills
            </Typography>

            <Popover open={open && hasAutocompleteKeywords}>
              <PopoverAnchor asChild>
                <TextField
                  inputRef={(ref) => {
                    inputRef.current = ref;
                  }}
                  inputId="skills"
                  label="Search skills"
                  leftIcon={<SearchIcon size={IconSize.Small} />}
                  rightIcon={
                    isFetching ? (
                      <GenericLoaderSpinner size={IconSize.Small} />
                    ) : undefined
                  }
                  hint={inputHint}
                  hintIcon={errorMessage ? undefined : <FeedbackIcon />}
                  valid={!errorMessage}
                  value={query}
                  onChange={({ target }) => {
                    if (target.value === '') {
                      return clearQuery();
                    }

                    return debouncedQuery(target.value);
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setOpen((prev) => !prev);
                      return;
                    }

                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (isAtLimit) {
                        if (query) {
                          displayToast(limitHint);
                          clearQuery();
                        }
                        return;
                      }

                      const newSkills = query
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .filter(
                          (k) => !existingSkillIdentities.has(skillIdentity(k)),
                        )
                        .filter((skill, index, batch) => {
                          const identity = skillIdentity(skill);

                          return (
                            batch.findIndex(
                              (item) => skillIdentity(item) === identity,
                            ) === index
                          );
                        });

                      if (newSkills.length === 0) {
                        if (query) {
                          clearQuery();
                        }
                        return;
                      }

                      const remainingSlots =
                        userExperienceSkillsLimit - skills.length;
                      const skillsToAdd = newSkills.slice(0, remainingSlots);

                      if (skillsToAdd.length < newSkills.length) {
                        displayToast(overflowHint);
                      }

                      if (skillsToAdd.length > 0) {
                        field.onChange([...skills, ...skillsToAdd]);
                      }

                      clearQuery();
                      return;
                    }

                    if (!open) {
                      setOpen(true);
                    }
                  }}
                />
              </PopoverAnchor>

              <PopoverContent
                side="top"
                align="start"
                avoidCollisions
                sameWidthAsAnchor
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={handlePopoverClose}
                onInteractOutside={handlePopoverClose}
                className="rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 data-[side=bottom]:mt-1 data-[side=top]:mb-1"
              >
                <div className="flex flex-wrap gap-2">
                  {autocompleteKeywords?.map(({ keyword }) => {
                    const isSelected = existingSkillIdentities.has(
                      skillIdentity(keyword),
                    );
                    return (
                      <TagElement
                        key={keyword}
                        tag={{ name: keyword }}
                        isSelected={isSelected}
                        onClick={() => {
                          if (isSelected) {
                            removeSkill(keyword);
                          } else {
                            addSkill(keyword);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-1 px-2 text-status-error typo-caption1"
              >
                {errorMessage}
              </div>
            )}

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <TagElement
                    key={skill}
                    tag={{ name: skill }}
                    isSelected
                    onClick={() => {
                      removeSkill(skill);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default ProfileSkills;
