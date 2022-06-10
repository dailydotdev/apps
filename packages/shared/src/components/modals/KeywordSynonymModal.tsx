import React, { ReactElement, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import request from 'graphql-request';
import classNames from 'classnames';
import { TextField } from '../fields/TextField';
import XIcon from '../icons/Close';
import {
  SEARCH_KEYWORDS_QUERY,
  SearchKeywordData,
  SET_KEYWORD_AS_SYNONYM_MUTATION,
} from '../../graphql/keywords';
import { apiUrl } from '../../lib/config';
import { Button } from '../buttons/Button';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './KeywordSynonymModal.module.css';

export type KeywordSynonymModalProps = { selectedKeyword: string } & ModalProps;

export default function KeywordSynonymModal({
  selectedKeyword,
  className,
  ...props
}: KeywordSynonymModalProps): ReactElement {
  const [query, setQuery] = useState(selectedKeyword);

  const { data: searchResults, isLoading: isSearching } =
    useQuery<SearchKeywordData>(['searchKeywords', query], () =>
      request(`${apiUrl}/graphql`, SEARCH_KEYWORDS_QUERY, { query }),
    );

  const { mutateAsync: setSynonym } = useMutation(
    (originalKeyword: string) =>
      request(`${apiUrl}/graphql`, SET_KEYWORD_AS_SYNONYM_MUTATION, {
        originalKeyword,
        keywordToUpdate: selectedKeyword.toLowerCase(),
      }),
    {
      onSuccess: () => props.onRequestClose(null),
    },
  );

  const emptyResults =
    !isSearching && !searchResults?.searchKeywords.hits.length;

  const onQueryChanged = (value: string): void => {
    setQuery(value);
  };

  return (
    <ResponsiveModal
      className={classNames(className, styles.keywordSynonymModal)}
      {...props}
    >
      <Button
        onClick={props.onRequestClose}
        buttonSize="small"
        title="Close"
        className="self-end btn-tertiary"
      >
        <XIcon />
      </Button>
      <h1 className="typo-callout">{`Find synonym for "${selectedKeyword}"`}</h1>
      <TextField
        inputId="search"
        name="search"
        label="Search for a keyword"
        value={selectedKeyword}
        autoFocus
        valueChanged={onQueryChanged}
        autoComplete="off"
        className="self-stretch mb-3"
      />
      {!emptyResults && (
        <ul className="flex flex-col gap-2 p-0 m-0 list-none">
          {searchResults?.searchKeywords.hits.slice(0, 5).map((keyword) => (
            <li className="p-0 m-0" key={keyword.value}>
              <Button
                onClick={() => setSynonym(keyword.value)}
                className="btn-tertiary"
              >
                {keyword.value}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        className="self-start mt-2 btn-primary"
        onClick={() => setSynonym(query)}
      >
        Create
      </Button>
    </ResponsiveModal>
  );
}
