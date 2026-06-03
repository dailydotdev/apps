import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import type { GQLPersona } from '../../graphql/feedSettings';
import { GET_ONBOARDING_PERSONAS_QUERY } from '../../graphql/feedSettings';
import useTagAndSource from '../../hooks/useTagAndSource';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { disabledRefetch } from '../../lib/func';
import { RequestKey, StaleTime, generateQueryKey } from '../../lib/query';
import { Button, ButtonColor } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import { ElementPlaceholder } from '../ElementPlaceholder';

export const MAX_PERSONAS = 3;

const personaButtonClassName =
  'w-full !justify-start text-left tablet:w-auto tablet:!justify-center';

export type PersonaSelectorMode = 'follow' | 'seed';

interface PersonaSelectorProps {
  className?: string;
  feedId?: string;
  mode?: PersonaSelectorMode;
  initialActiveIds?: string[];
  onSelectionChange?: (selected: GQLPersona[]) => void;
}

export function PersonaSelector({
  className,
  feedId,
  initialActiveIds = [],
  mode = 'follow',
  onSelectionChange,
}: PersonaSelectorProps): ReactElement | null {
  const { logEvent } = useLogContext();
  const [activeIds, setActiveIds] = useState<Set<string>>(
    () => new Set(initialActiveIds),
  );
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin: Origin.OnboardingPersona,
    feedId,
  });

  const {
    data: personas,
    isPending,
    isError,
  } = useQuery<GQLPersona[]>({
    queryKey: generateQueryKey(
      RequestKey.Tags,
      undefined,
      'onboardingPersonas',
    ),
    queryFn: async () => {
      const result = await gqlClient.request<{
        onboardingPersonas: GQLPersona[];
      }>(GET_ONBOARDING_PERSONAS_QUERY, {});
      return result.onboardingPersonas;
    },
    ...disabledRefetch,
    staleTime: StaleTime.OneHour,
  });

  const emitSelection = (nextActiveIds: Set<string>) => {
    if (!onSelectionChange || !personas) {
      return;
    }
    onSelectionChange(personas.filter((p) => nextActiveIds.has(p.id)));
  };

  const handleClick = async (persona: GQLPersona) => {
    const isActive = activeIds.has(persona.id);
    const isAtCap = !isActive && activeIds.size >= MAX_PERSONAS;
    if (isAtCap) {
      return;
    }

    logEvent({
      event_name: LogEvent.SelectOnboardingPersona,
      target_type: 'persona',
      target_id: persona.id,
      extra: JSON.stringify({
        action: isActive ? 'deselect' : 'select',
        tags_count: persona.tags.length,
        active_count: isActive ? activeIds.size - 1 : activeIds.size + 1,
      }),
    });

    if (isActive) {
      if (mode === 'follow') {
        await onUnfollowTags({ tags: persona.tags });
      }
      setActiveIds((prev) => {
        const next = new Set(prev);
        next.delete(persona.id);
        emitSelection(next);
        return next;
      });
      return;
    }

    if (mode === 'follow') {
      await onFollowTags({ tags: persona.tags, requireLogin: true });
    }
    setActiveIds((prev) => {
      const next = new Set(prev);
      next.add(persona.id);
      emitSelection(next);
      return next;
    });
  };

  if (isError) {
    return null;
  }

  const isAtCap = activeIds.size >= MAX_PERSONAS;

  return (
    <div
      role="group"
      aria-label="Pick a role to follow related tags"
      aria-busy={isPending}
      className={classNames(
        'flex w-full max-w-4xl flex-col gap-2 tablet:flex-row tablet:flex-wrap tablet:justify-center tablet:gap-3',
        className,
      )}
    >
      {isPending &&
        Array.from({ length: 10 }).map((_, i) => (
          <ElementPlaceholder
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="h-10 w-full rounded-12 tablet:h-9 tablet:w-32"
          />
        ))}
      {!isPending &&
        personas?.map((persona) => {
          const isActive = activeIds.has(persona.id);
          const isDisabled = !isActive && isAtCap;
          const buttonContent = (
            <>
              <span aria-hidden className="mr-2 shrink-0">
                {persona.emoji}
              </span>
              <span className="min-w-0 truncate">{persona.title}</span>
            </>
          );

          if (isActive) {
            return (
              <Button
                key={persona.id}
                pressed
                className={personaButtonClassName}
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                onClick={() => handleClick(persona)}
              >
                {buttonContent}
              </Button>
            );
          }

          return (
            <Button
              key={persona.id}
              className={personaButtonClassName}
              variant={ButtonVariant.Float}
              disabled={isDisabled}
              onClick={() => handleClick(persona)}
            >
              {buttonContent}
            </Button>
          );
        })}
    </div>
  );
}
