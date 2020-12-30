import styled from 'styled-components';
import ResponsiveModal from './ResponsiveModal';
import { mobileL } from '../../styles/media';
import { Props as ModalProps } from './StyledModal';
import React, { ReactElement, useState } from 'react';
import TextField from '../TextField';
import { size10, size3 } from '../../styles/sizes';
import XIcon from '../../icons/x.svg';
import { FloatButton, IconButton, InvertButton } from '../Buttons';
import { useMutation, useQuery } from 'react-query';
import {
  SEARCH_KEYWORDS_QUERY,
  SearchKeywordData,
  SET_KEYWORD_AS_SYNONYM_MUTATION,
} from '../../graphql/keywords';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import { typoLil1, typoLil2Base } from '../../styles/typography';

const Modal = styled(ResponsiveModal)`
  .Modal {
    ${mobileL} {
      max-height: 40rem;
    }
  }

  ${InvertButton} {
    align-self: flex-start;
  }
`;

const CloseButton = styled(IconButton)`
  align-self: flex-end;
`;

const Title = styled.h1`
  ${typoLil1}
`;

const SearchField = styled(TextField)`
  align-self: stretch;
  margin-bottom: ${size3};
`;

const ResultsList = styled.ul`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const ResultItem = styled.li`
  padding: 0;
  margin: 0;

  ${FloatButton} {
    height: ${size10};
    padding-top: 0;
    padding-bottom: 0;
    ${typoLil2Base}
  }
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
      <CloseButton title="Close" onClick={props.onRequestClose}>
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
      />
      {!emptyResults && (
        <ResultsList>
          {searchResults?.searchKeywords.hits.slice(0, 5).map((keyword) => (
            <ResultItem key={keyword.value}>
              <FloatButton onClick={() => setSynonym(keyword.value)}>
                {keyword.value}
              </FloatButton>
            </ResultItem>
          ))}
        </ResultsList>
      )}
      <InvertButton onClick={() => setSynonym(query)}>Create</InvertButton>
    </Modal>
  );
}
