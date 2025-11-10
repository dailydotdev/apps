import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { Company } from '../lib/userCompany';

export type TLocation = {
  id: string;
  city?: string;
  country: string;
  subdivision?: string;
};

export enum AutocompleteType {
  Location = 'location',
  Company = 'company',
  School = 'school',
}

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

const AUTOCOMPLETE_COMPANY_QUERY = gql`
  query AutocompleteCompany($query: String!, $limit: Int, $type: CompanyType) {
    autocompleteCompany(query: $query, limit: $limit, type: $type) {
      id
      name
      image
    }
  }
`;

export const getAutocompleteCompanies = async (
  query: string,
  type: AutocompleteType = AutocompleteType.Company,
  limit = 10,
): Promise<Company[]> => {
  const res = await gqlClient.request(AUTOCOMPLETE_COMPANY_QUERY, {
    query,
    limit,
    type,
  });
  return res.autocompleteCompany;
};
