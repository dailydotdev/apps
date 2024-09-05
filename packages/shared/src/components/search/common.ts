import { FormEvent, InputHTMLAttributes } from 'react';

import { SearchChunk } from '../../graphql/search';
import classed from '../../lib/classed';
import { SearchBarSuggestionListProps } from './SearchBarSuggestionList';

export const SearchHistoryContainer = classed('div', 'flex flex-col gap-3 p-6');

interface SearchBarClassName {
  container?: string;
  field?: string;
  form?: string;
}

export interface SearchBarInputProps {
  valueChanged?: (value: string) => void;
  showIcon?: boolean;
  showProgress?: boolean;
  className?: SearchBarClassName;
  onSubmit?: (event: FormEvent, input: string) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  chunk?: SearchChunk;
  shouldShowPopup?: boolean;
  suggestionsProps: SearchBarSuggestionListProps;
}
