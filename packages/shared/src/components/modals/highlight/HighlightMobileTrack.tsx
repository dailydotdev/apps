import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import type { PostHighlight } from '../../../graphql/highlights';

interface HighlightMobileTrackProps {
  activeHighlight: PostHighlight;
  currentContent: ReactNode;
  isLoadingNextPost: boolean;
  mobilePaneStyle: CSSProperties;
  mobileTrackStyle: CSSProperties;
  nextHighlight?: PostHighlight;
  nextPaneContent: ReactNode;
  previousHighlight?: PostHighlight;
  previousPaneContent: ReactNode;
}

export const HighlightMobileTrack = ({
  activeHighlight,
  currentContent,
  isLoadingNextPost,
  mobilePaneStyle,
  mobileTrackStyle,
  nextHighlight,
  nextPaneContent,
  previousHighlight,
  previousPaneContent,
}: HighlightMobileTrackProps): ReactElement => {
  return (
    <div
      aria-busy={isLoadingNextPost}
      className="flex w-[300%]"
      style={mobileTrackStyle}
    >
      <div
        key={previousHighlight?.id ?? 'previous-empty'}
        className="w-1/3 shrink-0"
        style={mobilePaneStyle}
      >
        {previousHighlight ? previousPaneContent : <div className="w-full" />}
      </div>
      <div
        key={activeHighlight.id}
        className="w-1/3 shrink-0"
        style={mobilePaneStyle}
      >
        {currentContent}
      </div>
      <div
        key={nextHighlight?.id ?? 'next-empty'}
        className="w-1/3 shrink-0"
        style={mobilePaneStyle}
      >
        {nextHighlight ? nextPaneContent : <div className="w-full" />}
      </div>
    </div>
  );
};
