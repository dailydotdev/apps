import React, { ReactElement, ReactNode, useCallback, useContext } from 'react';
import { QueryKey, useMutation, useQueryClient } from 'react-query';
import classNames from 'classnames';
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
import { Pill } from '../utilities/loaders';
import { WithClassNameProps } from '../utilities';
import classed from '../../lib/classed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';

export interface SearchResultProps {
  chunk: SearchChunk;
  queryKey: QueryKey;
  isInProgress: boolean;
  searchMessageProps?: Omit<SearchMessageProps, 'content'>;
}

interface ContainerProps extends WithClassNameProps {
  children: ReactNode;
}

const ContentPill = classed(Pill, 'w-full !h-3');

const Container = ({ children, className }: ContainerProps) => (
  <main className="order-2 laptop:order-3 col-span-2 px-4 laptop:px-8 mb-5 w-full">
    <WidgetContainer className={classNames('flex p-4', className)}>
      {children}
    </WidgetContainer>
  </main>
);

export function SearchResult({
  chunk,
  queryKey,
  isInProgress,
  searchMessageProps,
}: SearchResultProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const [isCopying, copyContent] = useCopyText(chunk.response);
  const { mutateAsync: sendFeedback } = useMutation(
    (value: number) => sendSearchFeedback({ chunkId: chunk.id, value }),
    {
      onMutate: (value) => {
        const previousValue = chunk.feedback;
        const eventNames = {
          1: AnalyticsEvent.UpvoteSearch,
          [-1]: AnalyticsEvent.DownvoteSearch,
        };

        client.setQueryData<Search>(queryKey, (search) =>
          updateSearchData(search, { feedback: value }),
        );

        trackEvent({
          event_name: eventNames[chunk.feedback],
          target_id: chunk.id,
        });

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

  const handleCopy = useCallback(() => {
    if (!isCopying && chunk?.id) {
      copyContent();
      trackEvent({
        event_name: AnalyticsEvent.CopySearch,
        target_id: chunk.id,
      });
    }
  }, [isCopying, copyContent, trackEvent, chunk?.id]);

  if (!chunk?.response) {
    return (
      <Container className="flex-col gap-2 p-6">
        <ContentPill />
        <ContentPill />
        <ContentPill className="!w-5/6" />
        <ContentPill className="!w-1/2" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex p-2 mr-4 w-10 h-10 rounded-10 bg-theme-color-cabbage">
        <LogoIcon className="max-w-full" />
      </div>
      <div className="flex-1">
        <SearchMessage
          {...searchMessageProps}
          content={chunk.response}
          isLoading={isInProgress}
        />
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
            onClick={handleCopy}
            disabled={isInProgress}
          />
        </div>
      </div>
    </Container>
  );
}
