import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import { TipCard, mockTips, MAX_VISIBLE_TIPS } from './TipCard';

const STACK_OFFSET = 10;
const ANIMATION_DURATION = 300;

export const Tips = (): ReactElement => {
  const [startIndex, setStartIndex] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  const getVisibleTips = useCallback(() => {
    return Array.from({ length: MAX_VISIBLE_TIPS }, (_, i) => {
      const tipIndex = (startIndex + i) % mockTips.length;
      return mockTips[tipIndex];
    });
  }, [startIndex]);

  const visibleTips = getVisibleTips();
  const stackHeight = 180 + (visibleTips.length - 1) * STACK_OFFSET;

  const handleSkip = useCallback(() => {
    if (isDismissing) {
      return;
    }

    setIsDismissing(true);

    setTimeout(() => {
      setStartIndex((prev) => (prev + 1) % mockTips.length);
      setIsDismissing(false);
    }, ANIMATION_DURATION);
  }, [isDismissing]);

  return (
    <div className="mb-4 p-3">
      <div className="relative" style={{ height: stackHeight }}>
        {visibleTips.map((tip, index) => (
          <TipCard
            key={tip.id}
            tip={tip}
            stackIndex={index}
            totalTips={visibleTips.length}
            isDismissing={index === 0 && isDismissing}
            onSkip={index === 0 ? handleSkip : undefined}
          />
        ))}
      </div>
    </div>
  );
};
