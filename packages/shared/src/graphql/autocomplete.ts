import { gql } from 'graphql-request';
import { gqlClient } from './common';

export type TLocation = {
  id: string;
  city?: string;
  country: string;
  subdivision?: string;
};

export const AUTOCOMPLETE_LOCATION_QUERY = gql`
  query AutocompleteLocation($query: String!) {
    autocompleteLocation(query: $query) {
      id
      country
      city
      subdivision
    }
  }
`;

export const getAutocompleteLocations = async (
  query: string,
): Promise<TLocation[]> => {
  const res = await gqlClient.request(AUTOCOMPLETE_LOCATION_QUERY, { query });
  return res.autocompleteLocation;
};
