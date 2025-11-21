import React, { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { PopoverContentProps } from '@radix-ui/react-popover';
import { Popover, PopoverAnchor } from '@radix-ui/react-popover';
import { Controller, useFormContext } from 'react-hook-form';
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

type ProfileSkillsProps = {
  name: string;
};

const ProfileSkills = ({ name }: ProfileSkillsProps): ReactElement => {
  const { control } = useFormContext();
  const [query, setQuery] = useState<string>('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data: autocompleteKeywords, isFetching } = useQuery(
    getKeywordAutocompleteOptions(query),
  );

  const [debouncedQuery] = useDebounceFn<string>((data) => setQuery(data), 300);

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

        const addSkill = (skill: string) => {
          if (skills.includes(skill)) {
            return;
          }
          field.onChange([...skills, skill]);
        };

        const removeSkill = (skill: string) => {
          field.onChange(skills.filter((s: string) => s !== skill));
        };

        return (
          <div className="flex flex-col gap-4">
            <Typography type={TypographyType.Callout} bold>
              Skills
            </Typography>

            <Popover open={open && autocompleteKeywords?.length > 0}>
              <PopoverAnchor asChild>
                <TextField
                  inputRef={(ref) => {
                    inputRef.current = ref;
                  }}
                  inputId="skills"
                  label="Search skills"
                  leftIcon={<SearchIcon size={IconSize.Small} />}
                  rightIcon={
                    isFetching && <GenericLoaderSpinner size={IconSize.Small} />
                  }
                  hint="Add commas (,) to add multiple skills. Press Enter to submit them."
                  hintIcon={<FeedbackIcon />}
                  value={query}
                  onChange={({ target }) => {
                    if (target.value === '') {
                      return setQuery('');
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
                      const newSkills = query
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .filter((k) => !skills.includes(k));

                      if (newSkills.length === 0) {
                        if (query) {
                          setQuery('');
                        }
                        return;
                      }

                      field.onChange([...skills, ...newSkills]);
                      setQuery('');
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
                    const isSelected = skills.includes(keyword);
                    return (
                      <TagElement
                        key={keyword}
                        tag={{ name: keyword }}
                        isSelected={isSelected}
                        onClick={({ tag }) => {
                          if (isSelected) {
                            removeSkill(tag.name);
                          } else {
                            addSkill(tag.name);
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
                    onClick={({ tag }) => {
                      removeSkill(tag.name);
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
