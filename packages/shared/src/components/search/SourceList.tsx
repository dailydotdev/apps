import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { WidgetContainer } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { PlaceholderSearchSource } from './PlaceholderSearchSource';
import { ClickableText } from '../buttons/ClickableText';
import { PageWidgets } from '../utilities';

const SourceItem = (): ReactElement => (
  <div className="w-60 laptop:w-full">
    <ClickableText
      tag="a"
      target="_blank"
      href="#"
      className="mb-2 typo-callout"
    >
      Understanding the LLaMa model and paper- mercurylabs.io
    </ClickableText>
    <p className="line-clamp-4 typo-footnote text-theme-label-tertiary multi-truncate">
      When sampling the LLaMA model, it is important to note that LLaMA, unlike
      popular models like ChatGPT, was not optimized or fine-tuned for some more
      text that will get cut off automatically
    </p>
  </div>
);

export const SourceList = (): ReactElement => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  return (
    <PageWidgets tablet={false} className="relative order-2 laptop:order-last">
      <i className="hidden laptop:block absolute top-8 -left-8 w-12 h-px bg-theme-divider-tertiary" />
      <WidgetContainer>
        <div
          className={classNames(
            'flex justify-between items-center py-1.5 laptop:py-4 px-4 laptop:bg-transparent rounded-t-16 bg-theme-bg-secondary',
            isSourcesOpen ? 'rounded-t-16' : 'rounded-16',
          )}
        >
          <p className="font-bold typo-callout text-theme-label-tertiary laptop:text-theme-label-quaternary">
            Sources <span className="inline-block laptop:hidden">(15)</span>
          </p>
          <Button
            icon={
              <ArrowIcon
                className={classNames(isSourcesOpen && 'rotate-180')}
              />
            }
            iconOnly
            buttonSize={ButtonSize.Small}
            className="block laptop:hidden btn-tertiary"
            onClick={() => setIsSourcesOpen((prev) => !prev)}
          />
        </div>
        <div
          className={classNames(
            'gap-4 p-4 laptop:min-h-[14rem] overflow-x-scroll flex-row laptop:flex-col',
            isSourcesOpen ? 'flex' : 'hidden laptop:flex',
          )}
        >
          <PlaceholderSearchSource />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SourceItem key={i} />
            ))}
        </div>

        <div className="hidden laptop:flex justify-between items-center p-3 border-t border-theme-divider-tertiary">
          <p className="ml-1 text-theme-label-tertiary typo-callout">1/1</p>
          <div className="flex ">
            <Button
              className="btn-tertiary"
              disabled
              icon={<ArrowIcon className="-rotate-90" />}
              iconOnly
              buttonSize={ButtonSize.Small}
            />
            <Button
              className="btn-tertiary"
              disabled
              icon={<ArrowIcon className="rotate-90" />}
              iconOnly
              buttonSize={ButtonSize.Small}
            />
          </div>
        </div>
      </WidgetContainer>
    </PageWidgets>
  );
};
