import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ReactModal from 'react-modal';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { Modal } from '../modals/common/Modal';
import { TutorialVideoButton } from './TutorialVideoButton';

const title = 'Make your feed your own';
const videoUrl =
  'https://storage.googleapis.com/devkit-assets/tutorials/feed-tags-v1.mp4';

function setup({ url = videoUrl, isGdprCovered = false } = {}) {
  const onParentClose = jest.fn();
  const onParentClick = jest.fn();
  const app = document.createElement('div');
  document.body.appendChild(app);
  ReactModal.setAppElement(app);
  render(
    <TestBootProvider client={new QueryClient()} auth={{ isGdprCovered }}>
      <Modal isOpen contentLabel="Feed settings" onRequestClose={onParentClose}>
        <input aria-label="Search tags" defaultValue="react" />
        <div onClick={onParentClick} role="presentation">
          <TutorialVideoButton videoUrl={url} title={title} />
        </div>
      </Modal>
    </TestBootProvider>,
    { container: app },
  );
  return { onParentClose, onParentClick };
}

it.each(['close button', 'Escape', 'backdrop'])(
  'closes only the tutorial with %s and keeps the parent state and focus',
  async (method) => {
    const { onParentClose, onParentClick } = setup();
    const trigger = screen.getByRole('button', { name: 'Watch how it works' });
    trigger.focus();
    fireEvent.click(trigger);
    const video = await screen.findByRole('dialog', { name: title });
    expect(screen.getByLabelText(title, { selector: 'video' })).toHaveAttribute(
      'src',
      videoUrl,
    );
    onParentClick.mockClear();
    if (method === 'close button') {
      fireEvent.click(
        within(video).getByRole('button', { name: 'Close video' }),
      );
    } else if (method === 'Escape') {
      fireEvent.keyDown(video, { key: 'Escape', code: 'Escape', keyCode: 27 });
    } else {
      // eslint-disable-next-line testing-library/no-node-access
      fireEvent.click(video.parentElement as HTMLElement);
    }
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: title }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('dialog', { name: 'Feed settings' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search tags' })).toHaveValue(
      'react',
    );
    expect(
      screen.queryByLabelText(title, { selector: 'video' }),
    ).not.toBeInTheDocument();
    expect(onParentClose).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  },
);

it('plays the hosted tutorial without requiring YouTube cookie consent', async () => {
  setup({ isGdprCovered: true });
  fireEvent.click(screen.getByRole('button', { name: 'Watch how it works' }));
  await screen.findByRole('dialog', { name: title });
  expect(screen.getByLabelText(title, { selector: 'video' })).toHaveAttribute(
    'controls',
  );
  expect(screen.getByLabelText(title, { selector: 'video' })).toHaveAttribute(
    'playsinline',
  );
  expect(
    screen.getByLabelText(title, { selector: 'video' }),
  ).not.toHaveAttribute('autoplay');
  expect(screen.getByRole('link', { name: 'Open video' })).toHaveAttribute(
    'href',
    videoUrl,
  );
  expect(
    screen.queryByRole('button', { name: 'Watch and accept cookies' }),
  ).not.toBeInTheDocument();
});

it('does not offer an unavailable walkthrough before its video is configured', () => {
  setup({ url: '' });
  expect(
    screen.queryByRole('button', { name: 'Watch how it works' }),
  ).not.toBeInTheDocument();
});
