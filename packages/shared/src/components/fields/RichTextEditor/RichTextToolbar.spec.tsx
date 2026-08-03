import { render, screen } from '@testing-library/react';
import React from 'react';
import type { Editor } from '@tiptap/react';
import { RichTextToolbar } from './RichTextToolbar';

jest.mock('@tiptap/react', () => ({
  useEditorState: () => ({
    isBold: false,
    isItalic: false,
    isBulletList: false,
    isOrderedList: false,
    isLink: false,
    canUndo: false,
    canRedo: false,
  }),
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => children,
}));

jest.mock('./LinkModal', () => ({
  LinkModal: () => null,
}));

const renderToolbar = (stackLeading: boolean) =>
  render(
    <RichTextToolbar
      editor={{} as Editor}
      onLinkAdd={jest.fn()}
      position="bottom"
      stackLeading={stackLeading}
      leadingActions={<button type="button">Free form</button>}
      rightActions={<button type="submit">Post</button>}
    />,
  );

describe('RichTextToolbar leading actions', () => {
  it('renders the leading slot exactly once inside the bar by default', () => {
    renderToolbar(false);

    expect(
      screen.getByRole('button', { name: 'Free form' }),
    ).toBeInTheDocument();
  });

  it('renders the leading slot exactly once on its own row when stacked', () => {
    // Regression: the stacked row rendered *in addition to* the inline slot,
    // so mobile showed two kind pickers.
    renderToolbar(true);

    expect(
      screen.getByRole('button', { name: 'Free form' }),
    ).toBeInTheDocument();
  });

  it('keeps the stacked leading slot out of the clipped bar row', () => {
    renderToolbar(true);

    const leading = screen.getByRole('button', { name: 'Free form' });
    // The clipped group is the `overflow-hidden` row; a stacked picker must
    // not live inside it, or narrow screens slice it again.
    expect(leading.closest('.overflow-hidden')).toBeNull();
  });
});
