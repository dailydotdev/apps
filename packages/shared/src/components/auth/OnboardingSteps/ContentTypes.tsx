import React, { ReactElement } from 'react';
import { CreateFeedButton } from '../../onboarding';

interface ContentTypesProps {
  onClick: () => void;
}

export const ContentTypes = ({ onClick }: ContentTypesProps): ReactElement => {
  return (
    <div>
      <h1>Content Types</h1>
      <CreateFeedButton className="mt-20" onClick={onClick} />
    </div>
  );
};
