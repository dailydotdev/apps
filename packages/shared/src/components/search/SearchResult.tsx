import React, { ReactElement } from 'react';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import LogoIcon from '../../svg/LogoIcon';
import UpvoteIcon from '../icons/Upvote';
import DownvoteIcon from '../icons/Downvote';
import CopyIcon from '../icons/Copy';
import { SearchMessage, SearchMessageProps } from './SearchMessage';
import {
  Search,
  SearchChunk,
  sendSearchFeedback,
  updateSearchData,
} from '../../graphql/search';
import { useCopyText } from '../../hooks/useCopy';
import { useToastNotification } from '../../hooks/useToastNotification';
import { labels } from '../../lib';

export interface SearchResultProps {
  chunk: SearchChunk;
  queryKey: QueryKey;
  isInProgress: boolean;
  searchMessageProps?: Omit<SearchMessageProps, 'content'>;
}

export function SearchResult({
  chunk,
  queryKey,
  isInProgress,
  searchMessageProps,
}: SearchResultProps): ReactElement {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const [isCopying, copyContent] = useCopyText(chunk.response);
  const { mutateAsync: sendFeedback } = useMutation(
    (value: number) => sendSearchFeedback({ chunkId: chunk.id, value }),
    {
      onMutate: (value) => {
        const previousValue = chunk.feedback;

        client.setQueryData<Search>(queryKey, (search) =>
          updateSearchData(search, { feedback: value }),
        );

        return () =>
          client.setQueryData<Search>(queryKey, (search) =>
            updateSearchData(search, { feedback: previousValue }),
          );
      },
      onSuccess: () => {
        displayToast(labels.search.feedbackText);
      },
      onError: (_, __, rollback: () => void) => rollback?.(),
    },
  );

  return (
    <main className="order-3 laptop:order-3 col-span-2 px-4 laptop:px-8 mb-5 w-full">
      <WidgetContainer className="flex p-4">
        <div className="flex p-2 mr-4 w-10 h-10 rounded-10 bg-theme-color-cabbage">
          <LogoIcon className="max-w-full" />
        </div>
        <div className="flex-1">
          <SearchMessage {...searchMessageProps} content={chunk.response} />
          <div className="flex pt-4">
            <Button
              className="btn-tertiary-avocado"
              iconOnly
              pressed={chunk.feedback === 1}
              icon={<UpvoteIcon secondary={chunk.feedback === 1} />}
              buttonSize={ButtonSize.Small}
              onClick={() => sendFeedback(chunk.feedback === 1 ? 0 : 1)}
              disabled={isInProgress}
            />
            <Button
              className="btn-tertiary-ketchup"
              iconOnly
              pressed={chunk.feedback === -1}
              icon={<DownvoteIcon secondary={chunk.feedback === -1} />}
              buttonSize={ButtonSize.Small}
              onClick={() => sendFeedback(chunk.feedback === -1 ? 0 : -1)}
              disabled={isInProgress}
            />
            <Button
              className="btn-tertiary"
              iconOnly
              icon={<CopyIcon secondary={isCopying} />}
              buttonSize={ButtonSize.Small}
              onClick={() => copyContent()}
            />
          </div>
        </div>
      </WidgetContainer>
    </main>
  );
}
