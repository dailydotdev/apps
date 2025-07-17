import React, { useCallback, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { ColorName } from '../../../styles/colors';
import { ArrowIcon } from '../../icons';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { usePromptsQuery } from '../../../hooks/prompt/usePromptsQuery';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { PromptDisplay } from '../../../graphql/prompt';
import { usePromptButtons } from '../../../hooks/prompt/usePromptButtons';
import { usePlusSubscription, useViewSize, ViewSize } from '../../../hooks';
import { LazyModal } from '../../modals/common/types';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import PromptButton from './PromptButton';
import { Tooltip } from '../../tooltip/Tooltip';

type PromptButtonsProps = {
  activePrompt: string;
  setActivePrompt: (prompt: string) => void;
  width: number;
  isContainedView: boolean;
};

export const PromptButtons = ({
  activePrompt,
  setActivePrompt,
  width,
  isContainedView = false,
}: PromptButtonsProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [showAll, setShowAll] = useState(false);
  const { openModal } = useLazyModal();
  const { data, isLoading } = usePromptsQuery();
  const { flags: settingFlags } = useSettingsContext();
  const { prompt: promptFlags } = settingFlags || {};
  const lastPrompt = settingFlags?.lastPrompt;
  const prompts = useMemo(() => {
    const filteredPrompts = data?.filter(
      (prompt) => promptFlags?.[prompt.id] !== false,
    );
    if (filteredPrompts?.length && lastPrompt) {
      const latPromptIndex = filteredPrompts.findIndex(
        (item) => item.id === lastPrompt,
      );
      const [lastPromptItem] = filteredPrompts.splice(latPromptIndex, 1);
      filteredPrompts.unshift(lastPromptItem);
    }
    return filteredPrompts;
  }, [data, lastPrompt, promptFlags]);

  const { isPlus } = usePlusSubscription();
  const promptList = usePromptButtons({
    prompts,
    width,
    offset: 82,
    base: 16,
    showAll: showAll || isMobile,
  });

  const showDrawer = isMobile && isContainedView;

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

  const openDrawerModal = useCallback(() => {
    openModal({
      type: LazyModal.MobileSmartPrompts,
      props: {
        prompts,
        onChoosePrompt: (prompt) => {
          setActivePrompt(prompt);
        },
      },
    });
  }, [openModal, prompts, setActivePrompt]);

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
        onClick={() =>
          showDrawer ? openDrawerModal() : setActivePrompt(PromptDisplay.TLDR)
        }
      >
        TLDR
      </PromptButton>

      {promptList?.map(({ id, label, flags, description }) => (
        <Tooltip
          key={id}
          content={description}
          className="max-w-70 text-center"
          visible={!isMobile}
        >
          <PromptButton
            active={activePrompt === id}
            flags={flags}
            onClick={() => (showDrawer ? openDrawerModal() : onPromptClick(id))}
          >
            {label}
          </PromptButton>
        </Tooltip>
      ))}

      {!showAll && !isMobile && promptList?.length > 0 && remainingTags > 0 && (
        <Tooltip content="See more prompts">
          <Button
            variant={ButtonVariant.Subtle}
            size={ButtonSize.XSmall}
            icon={<ArrowIcon className="rotate-180" />}
            iconPosition={ButtonIconPosition.Right}
            onClick={() => (showDrawer ? openDrawerModal() : setShowAll(true))}
          >
            {remainingTags}+ More
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
