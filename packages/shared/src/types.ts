export type PropsParameters<
  T extends (props: Record<string, unknown>) => unknown,
> = T extends (props: infer P) => unknown ? P : never;

declare module 'graphql-request' {
  export interface GraphQLClient {
    unsetHeader(header: string): GraphQLClient;
  }
}
