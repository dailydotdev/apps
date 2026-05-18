import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../../components/icons/MiniClose';
import { PlusIcon } from '../../../../components/icons/Plus';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  useTagSearch,
  MIN_SEARCH_QUERY_LENGTH,
} from '../../../../hooks/useTagSearch';
import { Origin } from '../../../../lib/log';
import { PersonaQuizFeedbackForm } from './PersonaQuizFeedbackForm';
import type { PersonaArchetype } from '../../types/funnel';

interface PersonaQuizRevealProps {
  archetype: PersonaArchetype | null;
  tags: string[];
  reveal: {
    eyebrow?: string;
    cta?: string;
    feedbackCta?: string;
    feedbackPlaceholder?: string;
    addTagCta?: string;
  };
  isFinalizing: boolean;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSubmitFeedback: (text: string) => void;
  onComplete: () => void;
}

const TagSearchPanel = ({
  excludeTags,
  onAdd,
}: {
  excludeTags: string[];
  onAdd: (tag: string) => void;
}): ReactElement => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const { data, isLoading } = useTagSearch({
    value: query,
    origin: Origin.EditTag,
  });
  const exclude = new Set(excludeTags);
  const suggestions =
    data?.searchTags?.tags.filter(
      (tag) => tag.name && !exclude.has(tag.name),
    ) ?? [];

  return (
    <div className="flex w-full flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search tags…"
        className="w-full rounded-8 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-primary typo-body placeholder:text-text-quaternary focus:border-text-tertiary focus:outline-none"
      />
      {query.length < MIN_SEARCH_QUERY_LENGTH ? (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search.
        </Typography>
      ) : null}
      {query.length >= MIN_SEARCH_QUERY_LENGTH && isLoading ? (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Searching…
        </Typography>
      ) : null}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 12).map((tag) => (
            <Button
              key={tag.name}
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => {
                if (tag.name) {
                  onAdd(tag.name);
                  setQuery('');
                }
              }}
              icon={<PlusIcon />}
            >
              {`#${tag.name}`}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PersonaQuizReveal = ({
  archetype,
  tags,
  reveal,
  isFinalizing,
  onAddTag,
  onRemoveTag,
  onSubmitFeedback,
  onComplete,
}: PersonaQuizRevealProps): ReactElement => {
  const [showAddTag, setShowAddTag] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fallback when no archetype was resolved (graph misconfiguration or an
  // unauthenticated dev preview path). Compose a tag-flavoured headline so the
  // reveal screen still feels personal.
  const humaniseTag = (tag: string): string => {
    const spaced = tag.replace(/-/g, ' ').trim();
    if (!spaced) {
      return tag;
    }
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const headlineFromTags = (): string => {
    const top = tags.slice(0, 3).map(humaniseTag);
    if (top.length === 0) {
      return 'Your feed is ready';
    }
    if (top.length === 1) {
      return `${top[0]}, locked in.`;
    }
    if (top.length === 2) {
      return `${top[0]} + ${top[1]}, locked in.`;
    }
    return `${top[0]}, ${top[1]}, ${top[2]} — locked in.`;
  };

  const headline = archetype?.headline ?? headlineFromTags();
  const eyebrow = archetype?.name ?? reveal.eyebrow;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 tablet:mx-auto tablet:max-w-md">
      <header className="flex flex-col items-center gap-2 text-center">
        {eyebrow && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          color={TypographyColor.Primary}
          bold
        >
          {headline}
        </Typography>
        {archetype?.description && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            {archetype.description}
          </Typography>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Your starting tags
        </Typography>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              onClick={() => onRemoveTag(tag)}
              icon={<MiniCloseIcon />}
              aria-label={`Remove ${tag}`}
            >
              {`#${tag}`}
            </Button>
          ))}
          {tags.length === 0 && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              No tags yet — add some below.
            </Typography>
          )}
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={() => setShowAddTag((value) => !value)}
            aria-expanded={showAddTag}
          >
            {reveal.addTagCta ?? 'Add tag'}
          </Button>
        </div>
        {showAddTag && <TagSearchPanel excludeTags={tags} onAdd={onAddTag} />}
      </section>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowFeedback((value) => !value)}
          className="self-start text-left text-text-link transition-colors typo-callout hover:text-text-primary"
          aria-expanded={showFeedback}
        >
          {reveal.feedbackCta ?? 'Nope, this isn’t me'}
        </button>
        {showFeedback && (
          <PersonaQuizFeedbackForm
            placeholder={reveal.feedbackPlaceholder}
            onSubmit={(text) => {
              onSubmitFeedback(text);
              setShowFeedback(false);
            }}
            onCancel={() => setShowFeedback(false)}
          />
        )}
      </section>

      <div className="sticky mx-auto mt-auto flex w-full max-w-md flex-col gap-2 px-1 pb-4 bottom-safe-or-2">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          onClick={onComplete}
          disabled={isFinalizing || tags.length === 0}
          loading={isFinalizing}
          className={classNames('w-full')}
        >
          {reveal.cta ?? 'Looks good'}
        </Button>
      </div>
    </div>
  );
};
