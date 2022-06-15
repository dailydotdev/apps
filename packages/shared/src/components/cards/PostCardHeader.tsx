import React, { ReactElement, ReactNode, useContext } from 'react';
import FeaturesContext from '../../contexts/FeaturesContext';
import OptionsButton from '../buttons/OptionsButton';
import { CardHeader } from './Card';
import SourceButton from './SourceButton';
import { Source } from '../../graphql/sources';
import { ReadArticleButton } from './ReadArticleButton';
import { getGroupedHoverContainer } from './common';

interface CardHeaderProps {
  children?: ReactNode;
  source: Source;
  onMenuClick?: (e: React.MouseEvent) => void;
  postLink: string;
}

const Container = getGroupedHoverContainer('span');

export const PostCardHeader = ({
  onMenuClick,
  children,
  source,
  postLink,
}: CardHeaderProps): ReactElement => {
  const { postModalByDefault, postEngagementNonClickable } =
    useContext(FeaturesContext);

  return (
    <CardHeader>
      <SourceButton source={source} />
      {children}
      <Container className="flex flex-row ml-auto">
        {(postModalByDefault || postEngagementNonClickable) && (
          <ReadArticleButton className="mr-2 btn-primary" href={postLink} />
        )}
        <OptionsButton onClick={onMenuClick} tooltipPlacement="top" />
      </Container>
    </CardHeader>
  );
};
