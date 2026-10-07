// Parked: the shipped files import gql from 'graphql-request', which the
// Storybook package does not depend on. The same tag: the query as a string.
export const gql = (
  chunks: TemplateStringsArray,
  ...values: unknown[]
): string =>
  chunks.reduce(
    (query, chunk, i) =>
      query + chunk + (i < values.length ? String(values[i]) : ''),
    '',
  );
