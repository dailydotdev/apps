import request from 'graphql-request';
import { SourceData, SOURCE_QUERY } from '../../graphql/sources';
import { apiUrl } from '../../lib/config';
import classed from '../../lib/classed';
import { Squad } from '../../graphql/squads';

export async function checkSourceExists(id: string): Promise<boolean> {
  try {
    const data = await request<SourceData>(`${apiUrl}/graphql`, SOURCE_QUERY, {
      id,
    });
    return !!data.source;
  } catch (err) {
    if (err?.response?.errors?.[0].extensions?.code === 'NOT_FOUND') {
      return false;
    }
    throw err;
  }
}

export enum ModalState {
  Details = 'Squad details',
  SelectArticle = 'Share article',
  WriteComment = 'Write comment',
  Ready = 'Squad ready',
}

export const SquadTitle = classed(
  'h3',
  'text-center typo-large-title font-bold',
);
export const SquadTitleColor = classed('span', 'text-theme-color-cabbage');

export type SquadForm = Pick<Squad, 'name' | 'handle' | 'description'> & {
  file?: string;
};
export type SquadStateProps = {
  modalState: ModalState;
  onNext: (squad?: SquadForm) => void;
  form: Partial<SquadForm>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SquadForm>>>;
};
