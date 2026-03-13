import type { ComponentType } from 'react';
import { gql } from 'graphql-request';
import type { Connection } from '../common';
import { gqlClient } from '../common';
import type { IconProps } from '../../components/Icon';
import { TerminalIcon } from '../../components/icons/Terminal';
import { LayoutIcon } from '../../components/icons/Layout';
import { ShortcutsIcon } from '../../components/icons/Shortcuts';
import { ClickIcon } from '../../components/icons/Click';
import { VolumeIcon } from '../../components/icons/Volume';
import { HomeIcon } from '../../components/icons/Home';
import { CameraIcon } from '../../components/icons/Camera';
import { MegaphoneIcon } from '../../components/icons/Megaphone';
import { SettingsIcon } from '../../components/icons/Settings';

export enum GearCategory {
  Computer = 'computer',
  Monitor = 'monitor',
  Keyboard = 'keyboard',
  Mouse = 'mouse',
  Headphones = 'headphones',
  Desk = 'desk',
  Webcam = 'webcam',
  Microphone = 'microphone',
  Other = 'other',
}

export const GEAR_CATEGORY_LABELS: Record<GearCategory, string> = {
  [GearCategory.Computer]: 'Computers',
  [GearCategory.Monitor]: 'Monitors',
  [GearCategory.Keyboard]: 'Keyboards',
  [GearCategory.Mouse]: 'Mice & Trackpads',
  [GearCategory.Headphones]: 'Headphones',
  [GearCategory.Desk]: 'Desks & Chairs',
  [GearCategory.Webcam]: 'Webcams',
  [GearCategory.Microphone]: 'Microphones',
  [GearCategory.Other]: 'Other',
};

export interface GearCategoryStyle {
  icon: ComponentType<IconProps>;
  iconColor: string;
  glowColor: string;
}

export const GEAR_CATEGORY_STYLES: Record<GearCategory, GearCategoryStyle> = {
  [GearCategory.Computer]: {
    icon: TerminalIcon,
    iconColor: 'text-accent-cabbage-default',
    glowColor: 'var(--theme-accent-cabbage-default)',
  },
  [GearCategory.Monitor]: {
    icon: LayoutIcon,
    iconColor: 'text-accent-blueCheese-default',
    glowColor: 'var(--theme-accent-blueCheese-default)',
  },
  [GearCategory.Keyboard]: {
    icon: ShortcutsIcon,
    iconColor: 'text-accent-onion-default',
    glowColor: 'var(--theme-accent-onion-default)',
  },
  [GearCategory.Mouse]: {
    icon: ClickIcon,
    iconColor: 'text-accent-water-default',
    glowColor: 'var(--theme-accent-water-default)',
  },
  [GearCategory.Headphones]: {
    icon: VolumeIcon,
    iconColor: 'text-accent-cheese-default',
    glowColor: 'var(--theme-accent-cheese-default)',
  },
  [GearCategory.Desk]: {
    icon: HomeIcon,
    iconColor: 'text-accent-avocado-default',
    glowColor: 'var(--theme-accent-avocado-default)',
  },
  [GearCategory.Webcam]: {
    icon: CameraIcon,
    iconColor: 'text-accent-bacon-default',
    glowColor: 'var(--theme-accent-bacon-default)',
  },
  [GearCategory.Microphone]: {
    icon: MegaphoneIcon,
    iconColor: 'text-accent-ketchup-default',
    glowColor: 'var(--theme-accent-ketchup-default)',
  },
  [GearCategory.Other]: {
    icon: SettingsIcon,
    iconColor: 'text-text-tertiary',
    glowColor: 'var(--theme-text-tertiary)',
  },
};

export interface DatasetGear {
  id: string;
  name: string;
  category?: GearCategory | null;
}

export interface Gear {
  id: string;
  gear: DatasetGear;
  position: number;
}

export interface PopularGearItem {
  gearId: string;
  name: string;
  category: GearCategory;
  userCount: number;
}

export interface GearCategoryInfo {
  category: GearCategory;
  count: number;
}

export interface AddGearInput {
  name: string;
}

export interface ReorderGearInput {
  id: string;
  position: number;
}

const GEAR_FRAGMENT = gql`
  fragment GearFragment on Gear {
    id
    position
    gear {
      id
      name
      category
    }
  }
`;

const GEAR_QUERY = gql`
  query Gear($userId: ID!, $first: Int, $after: String) {
    gear(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          ...GearFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${GEAR_FRAGMENT}
`;

const AUTOCOMPLETE_GEAR_QUERY = gql`
  query AutocompleteGear($query: String!) {
    autocompleteGear(query: $query) {
      id
      name
    }
  }
`;

const ADD_GEAR_MUTATION = gql`
  mutation AddGear($input: AddGearInput!) {
    addGear(input: $input) {
      ...GearFragment
    }
  }
  ${GEAR_FRAGMENT}
`;

const DELETE_GEAR_MUTATION = gql`
  mutation DeleteGear($id: ID!) {
    deleteGear(id: $id) {
      _
    }
  }
`;

const REORDER_GEAR_MUTATION = gql`
  mutation ReorderGear($items: [ReorderGearInput!]!) {
    reorderGear(items: $items) {
      ...GearFragment
    }
  }
  ${GEAR_FRAGMENT}
`;

export const getGear = async (
  userId: string,
  first = 50,
): Promise<Connection<Gear>> => {
  const result = await gqlClient.request<{
    gear: Connection<Gear>;
  }>(GEAR_QUERY, { userId, first });
  return result.gear;
};

export const searchGear = async (query: string): Promise<DatasetGear[]> => {
  const result = await gqlClient.request<{
    autocompleteGear: DatasetGear[];
  }>(AUTOCOMPLETE_GEAR_QUERY, { query });
  return result.autocompleteGear;
};

export const addGear = async (input: AddGearInput): Promise<Gear> => {
  const result = await gqlClient.request<{
    addGear: Gear;
  }>(ADD_GEAR_MUTATION, { input });
  return result.addGear;
};

export const deleteGear = async (id: string): Promise<void> => {
  await gqlClient.request(DELETE_GEAR_MUTATION, { id });
};

export const reorderGear = async (
  items: ReorderGearInput[],
): Promise<Gear[]> => {
  const result = await gqlClient.request<{
    reorderGear: Gear[];
  }>(REORDER_GEAR_MUTATION, { items });
  return result.reorderGear;
};

const POPULAR_GEAR_FRAGMENT = gql`
  fragment PopularGearFragment on PopularGearItem {
    gearId
    name
    category
    userCount
  }
`;

export const GEAR_DIRECTORY_QUERY = gql`
  query GearDirectory {
    computer: popularGear(category: computer, limit: 10) {
      ...PopularGearFragment
    }
    monitor: popularGear(category: monitor, limit: 10) {
      ...PopularGearFragment
    }
    keyboard: popularGear(category: keyboard, limit: 10) {
      ...PopularGearFragment
    }
    mouse: popularGear(category: mouse, limit: 10) {
      ...PopularGearFragment
    }
    headphones: popularGear(category: headphones, limit: 10) {
      ...PopularGearFragment
    }
    desk: popularGear(category: desk, limit: 10) {
      ...PopularGearFragment
    }
    webcam: popularGear(category: webcam, limit: 10) {
      ...PopularGearFragment
    }
    microphone: popularGear(category: microphone, limit: 10) {
      ...PopularGearFragment
    }
    other: popularGear(category: other, limit: 10) {
      ...PopularGearFragment
    }
    gearCategories {
      category
      count
    }
  }
  ${POPULAR_GEAR_FRAGMENT}
`;

export type GearDirectoryData = {
  [K in GearCategory]: PopularGearItem[];
} & {
  gearCategories: GearCategoryInfo[];
};
