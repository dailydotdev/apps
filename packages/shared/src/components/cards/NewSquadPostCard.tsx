import React, { ReactElement } from 'react';
import { Button } from '../buttons/Button';
import PlusIcon from '../icons/Plus';

export type AdCardProps = {
  onClick?: () => void;
};

export default function NewSquadPostCard({
  onClick,
}: AdCardProps): ReactElement {
  return (
    <Button
      className="flex flex-col justify-center items-center h-full rounded-14 border border-theme-color-cabbage hover:shadow-2-cabbage"
      onClick={onClick}
    >
      <Button
        className="mx-auto mb-4 btn-primary-cabbage"
        buttonSize="xlarge"
        icon={<PlusIcon />}
        tag="span"
        iconOnly
      />
      <span className="typo-title1">Create new post</span>
    </Button>
  );
}
