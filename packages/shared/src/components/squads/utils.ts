import request from 'graphql-request';
import { SourceData, SOURCE_QUERY } from '../../graphql/sources';
import { apiUrl } from '../../lib/config';
import classed from '../../lib/classed';
import {
  CreateSquadInput,
  CreateSquadOutput,
  CREATE_SQUAD_MUTATION,
  Squad,
} from '../../graphql/squads';
import { PostItem } from '../../graphql/posts';
import { base64ToFile } from '../../lib/base64';

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

export async function createSquad(form: SquadForm): Promise<Squad> {
  const inputData: CreateSquadInput = {
    commentary: form.commentary,
    description: form.description,
    handle: form.handle,
    name: form.name,
    postId: form.post.post.id,
    image: form.file ? await base64ToFile(form.file, 'image.jpg') : undefined,
  };
  const data = await request<CreateSquadOutput>(
    `${apiUrl}/graphql`,
    CREATE_SQUAD_MUTATION,
    inputData,
  );
  return data.createSquad;
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
  commentary: string;
  post: PostItem;
};

export type SquadStateProps = {
  onNext: (squad?: SquadForm) => void;
  form: Partial<SquadForm>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SquadForm>>>;
};
