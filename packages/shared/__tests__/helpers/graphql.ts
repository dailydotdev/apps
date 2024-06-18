/* eslint-disable @typescript-eslint/no-explicit-any */
import nock from 'nock';
import { GraphQLError } from 'graphql-request/dist/types';
import {
  ActionType,
  COMPLETE_ACTION_MUTATION,
} from '../../src/graphql/actions';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

export interface GraphQLResult<TData = Record<string, any>> {
  errors?: ReadonlyArray<GraphQLError>;
  data?: TData | null;
}

export interface MockedGraphQLResponse<TData = Record<string, any>> {
  request: GraphQLRequest;
  result: GraphQLResult<TData> | (() => GraphQLResult<TData>);
}

export const mockGraphQL = <TData = Record<string, any>>(
  res: MockedGraphQLResponse<TData>,
): void => {
  nock('http://localhost:3000')
    .post('/graphql', {
      ...res.request,
    })
    .reply(200, res.result);
};

export const completeActionMock = ({
  action,
}: {
  action: ActionType;
}): MockedGraphQLResponse => ({
  request: {
    query: COMPLETE_ACTION_MUTATION,
    variables: { type: action },
  },
  result: () => {
    return { data: { _: true } };
  },
});
