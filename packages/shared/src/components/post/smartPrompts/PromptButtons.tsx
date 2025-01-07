import React, { forwardRef, useCallback, useState } from 'react';
import type { ReactElement, Ref } from 'react';
import { ColorName } from '../../../styles/colors';
import { ArrowIcon, CustomPromptIcon } from '../../icons';
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
import { usePromptButtons } from '../../../hooks/prompt/usePromptButtons';
import { usePlusSubscription, useViewSize, ViewSize } from '../../../hooks';
import { SimpleTooltip } from '../../tooltips';
import { promptColorMap, PromptIconMap } from './common';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';

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
            className={!active && promptColorMap[flags.color]}
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
  activePrompt: string;
  setActivePrompt: (prompt: string) => void;
  width: number;
};

export const PromptButtons = ({
  activePrompt,
  setActivePrompt,
  width,
}: PromptButtonsProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [showAll, setShowAll] = useState(false);
  const { openModal } = useLazyModal();
  const { data: prompts, isLoading } = usePromptsQuery();
  const { isPlus } = usePlusSubscription();
  const promptList = usePromptButtons({
    prompts,
    width,
    offset: 82,
    base: 16,
    showAll: showAll || isMobile,
  });

  const promptsCount = prompts?.length || 0;
  const remainingTags = promptsCount - promptList?.length;

  const onPromptClick = useCallback(
    (id) => {
      if (isMobile && !isPlus) {
        openModal({
          type: LazyModal.SmartPrompt,
        });
        return;
      }
      setActivePrompt(id);
    },
    [isMobile, isPlus, openModal, setActivePrompt],
  );

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
        active={activePrompt === PromptDisplay.TLDR}
        flags={{ icon: 'TLDR', color: ColorName.Cabbage }}
        onClick={() => setActivePrompt(PromptDisplay.TLDR)}
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
            active={activePrompt === id}
            flags={flags}
            onClick={() => onPromptClick(id)}
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
