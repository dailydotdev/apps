import type { ModalProps } from '../../../../components/modals/common/Modal';

/**
 * `react-modal` types `onRequestClose` as a function that *requires* a
 * MouseEvent/KeyboardEvent, but callers programmatically closing the modal
 * don't have one. The upstream prop doesn't actually read the event, so we
 * cast past the type here in one place instead of sprinkling
 * `undefined as never` across every shortcut modal.
 */
export const invokeOnRequestClose = (
  onRequestClose?: ModalProps['onRequestClose'],
): void => {
  onRequestClose?.(undefined as never);
};
