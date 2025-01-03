import React, { forwardRef, useState } from 'react';
import type { ReactElement, Ref } from 'react';
import { ColorName } from '../../../styles/colors';
import {
  ArrowIcon,
  CustomPromptIcon,
  EditPromptIcon,
  TLDRIcon,
} from '../../icons';
import type { ButtonProps } from '../../buttons/Button';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { usePromptsQuery } from '../../../hooks/prompt/usePromptsQuery';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import type { PromptFlags } from '../../../graphql/prompt';
import { PromptDisplay } from '../../../graphql/prompt';
import { usePromptButtons } from '../../../hooks/feed/usePromptButtons';
import { useViewSize, ViewSize } from '../../../hooks';
import { SimpleTooltip } from '../../tooltips';

export const PromptIconMap = {
  TLDR: TLDRIcon,
  CustomPrompt: CustomPromptIcon,
  EditPrompt: EditPromptIcon,
};

type PromptButtonProps = ButtonProps<'button'> & {
  active: boolean;
  flags: PromptFlags;
};

const PromptButton = forwardRef(
  (
    { children, flags, active, ...props }: PromptButtonProps,
    ref?: Ref<HTMLButtonElement>,
  ): ReactElement => {
    const PromptIcon = PromptIconMap[flags.icon] || CustomPromptIcon;
    const variant = active ? ButtonVariant.Primary : ButtonVariant.Subtle;
    const color = active ? flags.color : undefined;
    return (
      <Button
        variant={variant}
        color={color}
        size={ButtonSize.XSmall}
        icon={
          <PromptIcon
            size={IconSize.XSmall}
            className={!active && `text-accent-${flags.color}-default`}
          />
        }
        {...props}
        ref={ref}
      >
        {children}
      </Button>
    );
  },
);
PromptButton.displayName = 'PromptButton';

type PromptButtonsProps = {
  activeDisplay: PromptDisplay;
  setActiveDisplay: (display: string) => void;
  width: number;
};

export const PromptButtons = ({
  activeDisplay,
  setActiveDisplay,
  width,
}: PromptButtonsProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [showAll, setShowAll] = useState(false);
  const { data: prompts, isLoading } = usePromptsQuery();
  const promptList = usePromptButtons({
    prompts,
    width,
    offset: 82,
    base: 16,
    showAll: showAll || isMobile,
  });

  const promptsCount = prompts?.length || 0;
  const remainingTags = promptsCount - promptList?.length;

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-x-1 gap-y-2">
        <ElementPlaceholder className="h-6 w-20 rounded-8" />
        <ElementPlaceholder className="h-6 w-26 rounded-8" />
        <ElementPlaceholder className="h-6 w-26 rounded-8" />
        <ElementPlaceholder className="h-6 w-26 rounded-8" />
        <ElementPlaceholder className="h-6 w-26 rounded-8" />
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex gap-x-1 gap-y-2 overflow-x-auto tablet:flex-wrap">
      <PromptButton
        active={activeDisplay === PromptDisplay.TLDR}
        flags={{ icon: 'TLDR', color: ColorName.Cabbage }}
        onClick={() => setActiveDisplay(PromptDisplay.TLDR)}
      >
        TLDR
      </PromptButton>

      {promptList?.map(({ id, label, flags, description }) => (
        <SimpleTooltip
          key={id}
          content={description}
          container={{ className: 'max-w-70 text-center' }}
          show={!isMobile}
        >
          <PromptButton
            active={activeDisplay === id}
            flags={flags}
            onClick={() => setActiveDisplay(id)}
          >
            {label}
          </PromptButton>
        </SimpleTooltip>
      ))}

      {!showAll && !isMobile && (
        <SimpleTooltip content="See more prompts">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon className="rotate-180" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={() => setShowAll(true)}
          >
            {remainingTags}+ More
          </Button>
        </SimpleTooltip>
      )}
    </div>
  );
};
