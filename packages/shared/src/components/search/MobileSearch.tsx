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
import { Button, ButtonVariant } from '../buttons/ButtonV2';
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

  const handleClearClick = (event: MouseEvent): void => {
    event.stopPropagation();
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <InteractivePopup
      position={InteractivePopupPosition.Screen}
      className="flex flex-col py-2"
    >
      <img
        className="absolute top-0 left-0 -z-1 w-full"
        src={cloudinary.feed.bg.mobile}
        alt="Gradient background"
      />
      <form className="flex flex-col" onSubmit={onSubmitForm}>
        <span className="flex z-1 flex-row gap-4 px-2 mr-2">
          <CloseButton
            type="button"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
              onClose(event, input)
            }
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            className="ml-auto"
            onClick={handleClearClick}
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
          placeholder="Ask a question..."
          onInput={(e) => setInput(e.currentTarget.value)}
        />
      </form>
      <div className="flex overflow-auto flex-col flex-1">
        {suggestionsProps && (
          <div className="flex flex-col p-4">
            <SearchBarSuggestionList {...suggestionsProps} />
          </div>
        )}
        <SearchHistory
          className="!p-4"
          showEmptyState={false}
          title="Search history"
          origin={suggestionsProps.origin}
        />
      </div>
    </InteractivePopup>
  );
}
