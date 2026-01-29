import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { Company } from '../lib/userCompany';

export type TLocation = {
  id: string;
  city?: string;
  country: string;
  subdivision?: string;
  externalId?: string;
  type?: number;
};

export enum AutocompleteType {
  Location = 'location',
  Company = 'company',
  School = 'school',
}

export enum LocationDataset {
  Internal = 'internal',
  External = 'external',
}

export const AUTOCOMPLETE_LOCATION_QUERY = gql`
  query AutocompleteLocation($query: String!, $dataset: LocationDataset) {
    autocompleteLocation(query: $query, dataset: $dataset) {
      id
      country
      city
      subdivision
    }
  }
`;

export const getAutocompleteLocations = async (
  query: string,
  dataset = LocationDataset.External,
): Promise<TLocation[]> => {
  const res = await gqlClient.request(AUTOCOMPLETE_LOCATION_QUERY, {
    query,
    dataset,
  });
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

export interface GitHubRepository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  image: string;
  description?: string | null;
}

const AUTOCOMPLETE_GITHUB_REPOSITORY_QUERY = gql`
  query AutocompleteGithubRepository($query: String!, $limit: Int) {
    autocompleteGithubRepository(query: $query, limit: $limit) {
      id
      owner
      name
      fullName
      url
      image
      description
    }
  }
`;

export const getAutocompleteGithubRepositories = async (
  query: string,
  limit = 10,
): Promise<GitHubRepository[]> => {
  const res = await gqlClient.request(AUTOCOMPLETE_GITHUB_REPOSITORY_QUERY, {
    query,
    limit,
  });
  return res.autocompleteGithubRepository;
};
