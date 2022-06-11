import classNames from 'classnames';
import React, { ReactElement, ReactNode, useContext } from 'react';
import FeaturesContext from '../../contexts/FeaturesContext';
import { Button } from '../buttons/Button';
import OptionsButton from '../buttons/OptionsButton';
import { CardHeader } from './Card';
import SourceButton from './SourceButton';
import { Source } from '../../graphql/sources';

interface CardHeaderProps {
  children?: ReactNode;
  source: Source;
  onMenuClick?: (e: React.MouseEvent) => void;
}

export const PostCardHeader = ({
  onMenuClick,
  children,
  source,
}: CardHeaderProps): ReactElement => {
  const { postModalByDefault, postEngagementNonClickable, postCardVersion } =
    useContext(FeaturesContext);
  const isV1 = postCardVersion === 'v1';

  return (
    <CardHeader>
      <SourceButton source={source} style={{ marginRight: '0.875rem' }} />
      {children}
      <span
        className={classNames(
          'flex flex-row ml-auto',
          isV1 &&
            !postModalByDefault &&
            'laptop:mouse:invisible laptop:mouse:group-hover:visible',
        )}
      >
        {isV1 && (postModalByDefault || postEngagementNonClickable) && (
          <Button className="btn-primary" buttonSize="small">
            Read article
          </Button>
        )}
        <OptionsButton onClick={onMenuClick} />
      </span>
    </CardHeader>
  );
};
