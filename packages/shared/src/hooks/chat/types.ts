import { QueryKey } from '@tanstack/react-query';
import { MouseEvent } from 'react';
import { Search, SearchChunkSource } from '../../graphql/search';

export interface UseChatProps {
  id?: string;
}

export enum UseChatMessageType {
  SessionCreated = 'session_created',
  WebSearchFinished = 'web_search_finished',
  WebResultsFiltered = 'web_results_filtered',
  StatusUpdated = 'status_updated',
  NewTokenReceived = 'new_token_received',
  Completed = 'completed',
  Error = 'error',
  SessionFound = 'session_found',
}

export interface SourcesMessage {
  sources: SearchChunkSource[];
}

export interface UseChatMessage<Payload = unknown> {
  type: UseChatMessageType;
  status?: string;
  timestamp: number;
  payload: Payload;
}

export interface UseChat {
  queryKey: QueryKey;
  data: Search;
  isLoading: boolean;
  handleSubmit(event: MouseEvent, value: string): void;
}

export interface CreatePayload {
  id: string;
  steps: number;
  chunk_id: string;
}

export interface TokenPayload {
  token: string;
}

export type UseChatSessionProps = Pick<UseChatProps, 'id'> & {
  streamId?: string;
};

export type UseChatSession = Pick<UseChat, 'queryKey' | 'isLoading' | 'data'>;

export type UseChatStream = Pick<UseChat, 'handleSubmit'> & { id?: string };
