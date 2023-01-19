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
      className="flex flex-col justify-center items-center h-full rounded-14 border hover:shadow-2-cabbage border-theme-color-cabbage"
      onClick={onClick}
    >
      <Button
        className="mx-auto mb-4 btn-primary-cabbage"
        buttonSize="xlarge"
        icon={<PlusIcon />}
        tag="span"
        iconOnly
      />
      <span className="typo-title1">Share post</span>
    </Button>
  );
}
