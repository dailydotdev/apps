import React, { ReactElement, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TextField } from '../fields/TextField';
import {
  SEARCH_KEYWORDS_QUERY,
  SearchKeywordData,
  SET_KEYWORD_AS_SYNONYM_MUTATION,
} from '../../graphql/keywords';
import { Button, ButtonVariant } from '../buttons/Button';
import { Modal, ModalProps } from './common/Modal';
import { gqlClient } from '../../graphql/common';

export type KeywordSynonymModalProps = { selectedKeyword: string } & ModalProps;

export default function KeywordSynonymModal({
  selectedKeyword,
  className,
  ...props
}: KeywordSynonymModalProps): ReactElement {
  const [query, setQuery] = useState(selectedKeyword);

  const { data: searchResults, isLoading: isSearching } =
    useQuery<SearchKeywordData>(['searchKeywords', query], () =>
      gqlClient.request(SEARCH_KEYWORDS_QUERY, { query }),
    );

  const { mutateAsync: setSynonym } = useMutation(
    (originalKeyword: string) =>
      gqlClient.request(SET_KEYWORD_AS_SYNONYM_MUTATION, {
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
    <Modal kind={Modal.Kind.FlexibleTop} size={Modal.Size.Medium} {...props}>
      <Modal.Header title={`Find synonym for "${selectedKeyword}"`} />
      <Modal.Body>
        <TextField
          inputId="search"
          name="search"
          label="Search for a keyword"
          value={selectedKeyword}
          autoFocus
          valueChanged={onQueryChanged}
          autoComplete="off"
          className={{ container: 'self-stretch' }}
        />
        {!emptyResults && (
          <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
            {searchResults?.searchKeywords.hits.slice(0, 5).map((keyword) => (
              <li className="m-0 p-0" key={keyword.value}>
                <Button
                  onClick={() => setSynonym(keyword.value)}
                  variant={ButtonVariant.Tertiary}
                >
                  {keyword.value}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className=" btn-primary" onClick={() => setSynonym(query)}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
