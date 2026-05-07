import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

interface DailyDjinnLandingProps {
  onStart: () => void;
}

export const DailyDjinnLanding = ({
  onStart,
}: DailyDjinnLandingProps): ReactElement => (
  <motion.section
    key="djinn-landing"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="z-10 relative flex w-full flex-col items-center gap-4 text-center"
  >
    <p className="font-mono uppercase tracking-[0.4em] text-text-tertiary typo-footnote">
      daily.dev presents
    </p>
    <h1 className="font-bold text-text-primary typo-mega3">DailyDjinn</h1>
    <p className="max-w-[28rem] text-text-tertiary typo-body">
      A series of questions. One ancient algorithm. Let me divine your developer
      persona.
    </p>
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      onClick={onStart}
      className="mt-2"
    >
      Summon my fate
    </Button>
  </motion.section>
);
