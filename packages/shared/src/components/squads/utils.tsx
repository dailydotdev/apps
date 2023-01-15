import React from 'react';
import request from 'graphql-request';
import { SourceData, SOURCE_QUERY } from '../../graphql/sources';
import { apiUrl } from '../../lib/config';
import classed from '../../lib/classed';
import {
  CreateSquadInput,
  CreateSquadOutput,
  CREATE_SQUAD_MUTATION,
  Squad,
  ADD_POST_TO_SQUAD_MUTATION,
} from '../../graphql/squads';
import { Post, PostItem } from '../../graphql/posts';
import { base64ToFile } from '../../lib/base64';
import { PromptOptions } from '../../hooks/usePrompt';

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

export const addPostToSquad = (data: PostToSquadProps): Promise<Post> =>
  request(`${apiUrl}/graphql`, ADD_POST_TO_SQUAD_MUTATION, data);

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
  SelectArticle = 'Pick an article',
  WriteComment = 'Post article',
  Ready = 'Almost there!',
}

export const SquadTitle = classed(
  'h3',
  'text-center typo-large-title font-bold',
);
export const SquadTitleColor = classed('span', 'text-theme-color-cabbage');

export type PostToSquadProps = {
  id: string;
  sourceId: string;
  commentary: string;
};

export type SquadForm = Pick<Squad, 'name' | 'handle' | 'description'> & {
  file?: string;
  commentary: string;
  post: PostItem;
  buttonText?: string;
};

export type SquadStateProps = {
  onNext: (squad?: SquadForm) => void;
  form: Partial<SquadForm>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SquadForm>>>;
  onRequestClose?: () => void;
};

export const quitSquadModal: PromptOptions = {
  title: 'Quit the process?',
  description: (
    <>
      <p>
        Learning is more powerful together. Are you sure you want to quit the
        process?
      </p>
      <p>p.s you can create a new Squad from the left sidebar</p>
    </>
  ),
  cancelButton: {
    title: 'Cancel',
  },
  okButton: {
    title: 'Continue',
    className: 'text-white btn-primary-ketchup',
  },
};
