import React from 'react';
import { useMessagePopupObserver } from './useMessagePopupObserver';

interface MessageSuggestionPopupProps {
  bubble: HTMLElement;
  id: string;
}

export function MessageSuggestionPopup({
  bubble,
  id,
}: MessageSuggestionPopupProps) {
  useMessagePopupObserver({ id, container: bubble });

  return null;
}
