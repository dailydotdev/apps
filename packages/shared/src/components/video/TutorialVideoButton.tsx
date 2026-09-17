import type { ReactElement } from 'react';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlayIcon } from '../icons/Play';

const TutorialVideoModal = dynamic(
  () =>
    import(/* webpackChunkName: "tutorialVideoModal" */ './TutorialVideoModal'),
);

export interface TutorialVideoButtonProps {
  videoId?: string;
  videoUrl: string;
  title: string;
}

export function TutorialVideoButton({
  videoId,
  videoUrl,
  title,
}: TutorialVideoButtonProps): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoId) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<PlayIcon />}
        className="self-start"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        Watch how it works
      </Button>
      {isOpen && (
        <TutorialVideoModal
          videoId={videoId}
          videoUrl={videoUrl}
          title={title}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
