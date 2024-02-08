import { gql } from 'graphql-request';

export type DevCard = {
  imageUrl: string;
};

export type DevCardData = { devCard: DevCard };

export const GENERATE_DEVCARD_MUTATION = gql`
  mutation GenerateDevCard(
    $theme: String
    $isProfileCover: Boolean
    $showBorder: Boolean
    $type: String
  ) {
    devCard: generateDevCard(
      theme: $theme
      isProfileCover: $isProfileCover
      showBorder: $showBorder
      type: $type
    ) {
      imageUrl
    }
  }
`;
