import React, { ReactElement, ReactNode, useCallback, useContext } from 'react';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { WidgetContainer } from '../widgets/common';
import LogoIcon from '../../svg/LogoIcon';
import { UpvoteIcon, DownvoteIcon, CopyIcon } from '../icons';
import { SearchMessage, SearchMessageProps } from './SearchMessage';
import {
  Search,
  SearchChunk,
  sendSearchFeedback,
  updateSearchData,
} from '../../graphql/search';
import { useCopyText } from '../../hooks/useCopy';
import { useToastNotification } from '../../hooks';
import { labels } from '../../lib';
import { Pill } from '../utilities/loaders';
import { WithClassNameProps } from '../utilities';
import classed from '../../lib/classed';
import LogContext from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';

export interface SearchResultProps {
  chunk: SearchChunk;
  queryKey: QueryKey;
  isInProgress: boolean;
  searchMessageProps?: Omit<SearchMessageProps, 'content'>;
  className?: string;
}

interface ContainerProps extends WithClassNameProps {
  children: ReactNode;
}

const ContentPill = classed(Pill, 'w-full !h-3');

const Container = ({ children, className }: ContainerProps) => (
  <main className="order-2 col-span-2 w-full laptop:order-3">
    <WidgetContainer className={classNames('flex p-4', className)}>
      {children}
    </WidgetContainer>
  </main>
);

export function SearchResult({
  chunk,
  queryKey,
  className,
  isInProgress,
  searchMessageProps,
}: SearchResultProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const [isCopying, copyContent] = useCopyText(chunk.response);
  const { mutateAsync: sendFeedback } = useMutation(
    (value: number) => sendSearchFeedback({ chunkId: chunk.id, value }),
    {
      onMutate: (value) => {
        const previousValue = chunk.feedback;
        const eventNames = {
          1: LogEvent.UpvoteSearch,
          [-1]: LogEvent.DownvoteSearch,
        };

        client.setQueryData<Search>(queryKey, (search) =>
          updateSearchData(search, { feedback: value }),
        );

        logEvent({
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
      logEvent({
        event_name: LogEvent.CopySearch,
        target_id: chunk.id,
      });
    }
  }, [isCopying, copyContent, logEvent, chunk?.id]);

  if (!chunk?.response && !chunk?.error) {
    return (
      <Container className={classNames('flex-col gap-2 p-6', className)}>
        <ContentPill />
        <ContentPill />
        <ContentPill />
        <ContentPill />
        <ContentPill />
        <ContentPill />
        <ContentPill className="!w-5/6" />
        <ContentPill className="!w-5/6" />
        <ContentPill className="!w-1/2" />
      </Container>
    );
  }

  if (!chunk?.response) {
    return null;
  }

  return (
    <Container className={className}>
      <div className="mr-4 flex h-10 w-10 rounded-10 bg-accent-cabbage-default p-2">
        <LogoIcon className={{ container: 'max-w-full' }} />
      </div>
      <div className="flex-1">
        <SearchMessage
          {...searchMessageProps}
          content={chunk.response}
          isLoading={isInProgress}
        />
        <div className="flex pt-4">
          <Button
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Avocado}
            className="mr-2"
            pressed={chunk.feedback === 1}
            icon={<UpvoteIcon secondary={chunk.feedback === 1} />}
            onClick={() => sendFeedback(chunk.feedback === 1 ? 0 : 1)}
            disabled={isInProgress}
          />
          <Button
            variant={ButtonVariant.Tertiary}
            color={ButtonColor.Ketchup}
            className="mr-2"
            pressed={chunk.feedback === -1}
            icon={<DownvoteIcon secondary={chunk.feedback === -1} />}
            onClick={() => sendFeedback(chunk.feedback === -1 ? 0 : -1)}
            disabled={isInProgress}
          />
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<CopyIcon secondary={isCopying} />}
            onClick={handleCopy}
            disabled={isInProgress}
          />
        </div>
      </div>
    </Container>
  );
}
