import styled from '@emotion/styled';
import { mobileL } from '../../styles/media';
import React, { ReactElement, useState } from 'react';
import { TextField } from '@dailydotdev/shared';
import sizeN from '../../macros/sizeN.macro';
import XIcon from '@dailydotdev/shared/icons/x.svg';
import { useMutation, useQuery } from 'react-query';
import {
  SEARCH_KEYWORDS_QUERY,
  SearchKeywordData,
  SET_KEYWORD_AS_SYNONYM_MUTATION,
} from '../../graphql/keywords';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { typoCallout } from '../../styles/typography';
import {
  Button,
  ButtonProps,
  ModalProps,
  ResponsiveModal,
} from '@dailydotdev/shared';

const Modal = styled(ResponsiveModal)`
  .modal {
    ${mobileL} {
      max-height: 40rem;
    }
  }
`;

const CloseButton = styled(Button)<ButtonProps<'button'>>`
  align-self: flex-end;
`;

const Title = styled.h1`
  ${typoCallout}
`;

const SearchField = styled(TextField)`
  align-self: stretch;
  margin-bottom: ${sizeN(3)};
`;

const ResultsList = styled.ul`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  list-style: none;
  gap: ${sizeN(2)};
`;

const ResultItem = styled.li`
  padding: 0;
  margin: 0;
`;

export type KeywordSynonymModal = { selectedKeyword: string } & ModalProps;

export default function KeywordSynonymModal({
  selectedKeyword,
  ...props
}: KeywordSynonymModal): ReactElement {
  const [query, setQuery] = useState(selectedKeyword);

  const {
    data: searchResults,
    isLoading: isSearching,
  } = useQuery<SearchKeywordData>(['searchKeywords', query], () =>
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
    <Modal {...props}>
      <CloseButton
        onClick={props.onRequestClose}
        buttonSize="small"
        title="Close"
        className="btn-tertiary"
      >
        <XIcon />
      </CloseButton>
      <Title>{`Find synonym for "${selectedKeyword}"`}</Title>
      <SearchField
        inputId="search"
        name="search"
        label="Search for a keyword"
        value={selectedKeyword}
        autoFocus
        valueChanged={onQueryChanged}
        autoComplete="off"
      />
      {!emptyResults && (
        <ResultsList>
          {searchResults?.searchKeywords.hits.slice(0, 5).map((keyword) => (
            <ResultItem key={keyword.value}>
              <Button
                onClick={() => setSynonym(keyword.value)}
                className="btn-tertiary"
              >
                {keyword.value}
              </Button>
            </ResultItem>
          ))}
        </ResultsList>
      )}
      <Button
        className="btn-primary"
        onClick={() => setSynonym(query)}
        style={{ marginTop: sizeN(2), alignSelf: 'flex-start' }}
      >
        Create
      </Button>
    </Modal>
  );
}
