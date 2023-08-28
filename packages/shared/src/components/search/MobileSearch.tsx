import React, {
  MouseEvent,
  FormEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState,
  FormEvent,
} from 'react';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { cloudinary } from '../../lib/image';
import CloseButton from '../CloseButton';
import { Button } from '../buttons/Button';
import { SearchSubmitButton } from './SearchSubmitButton';
import {
  SearchBarSuggestionList,
  SearchBarSuggestionListProps,
} from './SearchBarSuggestionList';
import { SearchHistory } from './SearchHistory';

interface MobileSearchProps {
  input: string;
  suggestionsProps: SearchBarSuggestionListProps;
  onSubmit(event: FormEvent, value: string): void;
  onClose(event: MouseEvent, value: string): void;
}

export function MobileSearch({
  input: initialInput,
  onClose,
  onSubmit,
  suggestionsProps,
}: MobileSearchProps): ReactElement {
  const [input, setInput] = useState(initialInput);
  const inputRef = useRef<HTMLInputElement>();

  const onSubmitForm: FormEventHandler = (event) => {
    event.preventDefault();
    onSubmit(event, input);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <InteractivePopup
      position={InteractivePopupPosition.Center}
      className="flex flex-col py-2 w-screen h-screen"
    >
      <img
        className="absolute top-0 left-0 -z-1 w-full"
        src={cloudinary.feed.bg.mobile}
        alt="Gradient background"
      />
      <form className="flex flex-col" onSubmit={onSubmitForm}>
        <span className="flex z-1 flex-row gap-4 px-2">
          <CloseButton
            type="button"
            onClick={(event) => onClose(event, input)}
          />
          <Button
            type="button"
            className="ml-auto btn-tertiary"
            onClick={() => setInput('')}
            disabled={!input}
          >
            Clear
          </Button>
          <SearchSubmitButton
            tooltipProps={{
              content: !input && 'Enter text to start searching',
            }}
            buttonProps={{ disabled: !input }}
          />
        </span>
        <input
          className="p-4 mb-2 bg-transparent border-b outline-none border-theme-divider-secondary typo-body caret-theme-color-cabbage"
          type="text"
          value={input}
          ref={inputRef}
          placeholder="Ask anything..."
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </form>
      {suggestionsProps && (
        <div className="flex flex-col p-4">
          <SearchBarSuggestionList {...suggestionsProps} />
        </div>
      )}
      <SearchHistory
        className="!p-4"
        showEmptyState={false}
        title="Search history"
      />
    </InteractivePopup>
  );
}
