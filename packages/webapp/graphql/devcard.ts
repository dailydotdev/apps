import { gql } from 'graphql-request';

export type DevCard = {
  imageUrl: string;
};

export type DevCardData = { devCard: DevCard };

export const GENERATE_DEVCARD_MUTATION = gql`
  mutation GenerateDevCard(
    $theme: DevCardTheme
    $type: DevCardType
    $isProfileCover: Boolean
    $showBorder: Boolean
  ) {
    devCard: generateDevCardV2(
      theme: $theme
      type: $type
      isProfileCover: $isProfileCover
      showBorder: $showBorder
    ) {
      imageUrl
    }
  }
`;
