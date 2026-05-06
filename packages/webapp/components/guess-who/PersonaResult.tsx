import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import type { GuessWhoQuizFinalPersona } from '@dailydotdev/shared/src/graphql/guessWhoQuiz';

interface PersonaResultProps {
  persona: GuessWhoQuizFinalPersona;
  onRestart: () => void;
}

export const PersonaResult = ({
  persona,
  onRestart,
}: PersonaResultProps): ReactElement => {
  const { logEvent } = useLogContext();
  const didLog = useRef(false);

  useEffect(() => {
    if (didLog.current) {
      return;
    }
    didLog.current = true;
    logEvent({
      event_name: LogEvent.CompleteGuessWhoQuiz,
      extra: JSON.stringify({
        persona: persona.name,
        tagCount: persona.tags.length,
      }),
    });
  }, [logEvent, persona.name, persona.tags.length]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex w-full max-w-[36rem] flex-col items-center gap-6 rounded-16 border border-border-subtlest-secondary bg-background-subtle p-6 laptop:p-8"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-text-tertiary typo-footnote">You are a…</p>
        <h2 className="font-bold text-text-primary typo-title2">
          {persona.name}
        </h2>
        <p className="text-text-tertiary typo-body">{persona.description}</p>
      </div>

      {persona.tags.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2">
          {persona.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-8 border border-border-subtlest-tertiary bg-background-default px-3 py-1 text-text-secondary typo-callout"
            >
              #{tag}
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Medium}
        onClick={onRestart}
      >
        Start over
      </Button>
    </motion.section>
  );
};
