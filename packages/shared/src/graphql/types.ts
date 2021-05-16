import 'graphql-request/dist/types';

declare module 'graphql-request/dist/types' {
  interface GraphQLError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: Record<string, any>;
  }
}
