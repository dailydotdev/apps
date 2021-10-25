import { gql } from 'graphql-request';

export type DevCard = {
  imageUrl: string;
};

export type DevCardData = { devCard: DevCard };

export const GENERATE_DEVCARD_MUTATION = gql`
  mutation GenerateDevCard($file: Upload, $url: String) {
    devCard: generateDevCard(file: $file, url: $url) {
      imageUrl
    }
  }
`;
