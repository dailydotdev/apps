import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Squad } from '../../../graphql/sources';
import MarkdownInput from '../../fields/MarkdownInput';
import { WriteFooter } from './WriteFooter';
import { SubmitExternalLink } from './SubmitExternalLink';

interface ShareLinkProps {
  squad: Squad;
  className?: string;
}

export function ShareLink({ className }: ShareLinkProps): ReactElement {
  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
  };

  return (
    <form
      className={classNames('flex flex-col gap-4', className)}
      onSubmit={onSubmit}
    >
      <SubmitExternalLink />
      <MarkdownInput
        enabledCommand={{ mention: true }}
        showMarkdownGuide={false}
      />
      <WriteFooter />
    </form>
  );
}
