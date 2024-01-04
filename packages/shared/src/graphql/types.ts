declare module 'graphql-request/dist/types' {
  interface GraphQLError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions?: Record<string, any>;
    message?: string;
  }
}
