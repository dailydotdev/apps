import { Source } from './sources';

export interface Squad extends Source {
  active: boolean;
  handle: string;
  image: string;
  permalink: string;
  public: boolean;
  type: 'squad';
}

export type Squads = {
  squads: Squad[];
};
