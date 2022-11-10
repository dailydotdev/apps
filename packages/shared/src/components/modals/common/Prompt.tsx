import React, { ReactElement } from 'react';

export type PromptProps = {
  title: string;
};

export function Prompt({ title }: PromptProps): ReactElement {
  return <span>{title}</span>;
}
