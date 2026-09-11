import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { PopoverContentProps } from '@radix-ui/react-popover';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import type { FieldError } from 'react-hook-form';
import { Controller, useFormContext, useFormState } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { TextField } from '../../../components/fields/TextField';
import { FeedbackIcon, SearchIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { TagElement } from '../../../components/feeds/FeedSettings/TagElement';
import { PopoverContent } from '../../../components/popover/Popover';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { GenericLoaderSpinner } from '../../../components/utilities/loaders';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { getKeywordAutocompleteOptions } from '../../opportunity/queries';
import { maxProfileSkillLength, maxProfileSkills } from '../common';

type ProfileSkillsProps = {
  name: string;
};

const skillsHint =
  'Add commas (,) to add multiple skills. Press Enter to submit them.';
const limitHint = `You can add up to ${maxProfileSkills} skills.`;

// The API stores skills under slugify(value), so "React" and "react" are the
// same skill to it but two entries here.
const skillKey = (skill: string) => skill.trim().toLowerCase();

/**
 * A rejected skill arrives either as an array-level issue (path `skills`) or as
 * an item-level one (path `skills.3`), which react-hook-form stores as a sparse
 * array with no message on the root. Reading `error.message` alone would render
 * nothing for the second shape.
 */
const getSkillsError = (
  error: FieldError | FieldError[] | undefined,
): string | undefined => {
  if (!error) {
    return undefined;
  }

  if (Array.isArray(error)) {
    return error.find((item) => item?.message)?.message ?? limitHint;
  }

  return error.message ?? limitHint;
};

const ProfileSkills = ({ name }: ProfileSkillsProps): ReactElement => {
  const { control } = useFormContext();
  // useController subscribes to its own name exactly, so a server issue on
  // `skills.3` never reaches the Controller. useFormState subscribes to the
  // whole subtree, which covers both the array and the item level paths.
  const { errors } = useFormState({ control, name });
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
      render={({ field }) => {
        const skills = Array.isArray(field.value) ? field.value : [];
        const isAtLimit = skills.length >= maxProfileSkills;
        const error = getSkillsError(
          errors[name] as FieldError | FieldError[] | undefined,
        );

        const addSkills = (candidates: string[]) => {
          const seen = new Set(skills.map(skillKey));
          const room = maxProfileSkills - skills.length;
          const accepted: string[] = [];
          let overLimit = 0;
          let tooLong = 0;

          candidates
            .map((candidate) => candidate.trim())
            .filter(Boolean)
            .forEach((skill) => {
              if (seen.has(skillKey(skill))) {
                return;
              }

              if (skill.length > maxProfileSkillLength) {
                tooLong += 1;
                return;
              }

              if (accepted.length >= room) {
                overLimit += 1;
                return;
              }

              seen.add(skillKey(skill));
              accepted.push(skill);
            });

          // Dropping part of a paste silently is the bug being fixed, so always
          // say what was left out.
          if (overLimit) {
            displayToast(
              `${limitHint} ${overLimit} ${
                overLimit === 1 ? 'skill was' : 'skills were'
              } not added.`,
            );
          } else if (tooLong) {
            displayToast(
              `Skills can be up to ${maxProfileSkillLength} characters. ${tooLong} ${
                tooLong === 1 ? 'skill was' : 'skills were'
              } not added.`,
            );
          }

          if (accepted.length) {
            field.onChange([...skills, ...accepted]);
          }
        };

        const removeSkill = (skill: string) => {
          field.onChange(
            skills.filter((s: string) => skillKey(s) !== skillKey(skill)),
          );
        };

        const getHint = () => {
          if (error) {
            return error;
          }

          return isAtLimit ? limitHint : skillsHint;
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
                  hint={getHint()}
                  hintIcon={<FeedbackIcon />}
                  valid={!error}
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
                      addSkills(query.split(','));
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
                    const isSelected = skills.some(
                      (skill: string) => skillKey(skill) === skillKey(keyword),
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
                            addSkills([keyword]);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

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
