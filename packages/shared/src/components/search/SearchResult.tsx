import React, { ReactElement } from 'react';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import LogoIcon from '../../svg/LogoIcon';
import UpvoteIcon from '../icons/Upvote';
import DownvoteIcon from '../icons/Downvote';
import CopyIcon from '../icons/Copy';

export const SearchResult = (): ReactElement => (
  <main className="order-3 laptop:order-3 col-span-2 px-4 laptop:px-8">
    <WidgetContainer className="flex p-4">
      <div className="flex p-2 mr-4 w-10 h-10 rounded-10 bg-theme-color-cabbage">
        <LogoIcon className="max-w-full" />
      </div>
      <div>
        <p>Result here</p>
        <div className="flex pt-4">
          <Button
            className="btn-tertiary"
            iconOnly
            icon={<UpvoteIcon />}
            buttonSize={ButtonSize.Small}
          />
          <Button
            className="btn-tertiary"
            iconOnly
            icon={<DownvoteIcon />}
            buttonSize={ButtonSize.Small}
          />
          <Button
            className="btn-tertiary"
            iconOnly
            icon={<CopyIcon />}
            buttonSize={ButtonSize.Small}
          />
        </div>
      </div>
    </WidgetContainer>
  </main>
);
