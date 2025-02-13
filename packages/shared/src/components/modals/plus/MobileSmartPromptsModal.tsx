import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import type { Prompt } from '../../../graphql/prompt';
import PromptButton from '../../post/smartPrompts/PromptButton';
import { PromptDisplay } from '../../../graphql/prompt';
import { ColorName } from '../../../styles/colors';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';

type MobileSmartPromptsModalProps = Omit<ModalProps, 'children'> & {
  prompts: Prompt[];
  onChoosePrompt?: (prompt: string) => void;
};

export const MobileSmartPromptsModal = ({
  prompts,
  onChoosePrompt,
  ...props
}: MobileSmartPromptsModalProps): ReactElement => {
  const onClick = (event, id) => {
    onChoosePrompt?.(id);
    props.onRequestClose?.(event);
  };

  return (
    <Modal {...props} isDrawerOnMobile>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <PromptButton
            active={false}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Option}
            flags={{ icon: 'TLDR', color: ColorName.Cabbage }}
            className="w-full"
            onClick={(event) => onClick(event, PromptDisplay.TLDR)}
          >
            TLDR
          </PromptButton>
          {prompts?.map(({ id, label, flags }) => (
            <PromptButton
              active={false}
              size={ButtonSize.Medium}
              variant={ButtonVariant.Option}
              key={id}
              flags={flags}
              onClick={(event) => onClick(event, id)}
            >
              {label}
            </PromptButton>
          ))}
        </div>
      </div>
    </Modal>
  );
};
