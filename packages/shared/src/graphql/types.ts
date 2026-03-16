declare module 'graphql-request/dist/types' {
  interface GraphQLError {
    extensions?: Record<string, unknown>;
    message?: string;
  }
}
