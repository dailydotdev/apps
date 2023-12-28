import { GraphQLError } from 'graphql-request/dist/types';

declare module 'graphql-request/dist/types' {
  interface GraphQLError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: Record<string, any>;
  }
}

export interface MutationError {
  data: unknown;
  errors: GraphQLError[];
}

export interface ResponseError {
  response: MutationError;
}
