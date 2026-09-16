import { gql } from 'graphql-request';
import { gqlClient } from '../common';

export const ADD_PREFERRED_SOURCE_MUTATION = gql`
  mutation AddPreferredSource {
    addPreferredSource {
      _
    }
  }
`;

/**
 * Tells the API the reader opened Google's flow, which is what unlocks the
 * achievement. Self-reported by necessity: Google exposes no read API, so this
 * records the attempt rather than the outcome.
 */
export const addPreferredSource = async (): Promise<void> => {
  await gqlClient.request(ADD_PREFERRED_SOURCE_MUTATION);
};
