import React from 'react';
import { render, screen } from '@testing-library/react';
import { FunnelStepTopBar } from './FunnelStepTopBar';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: () => false,
}));

describe('FunnelStepTopBar', () => {
  // The strip shrink-wrapped to the logo under a parent that centres its
  // children, which slid the mark into the middle of the screen and onto the
  // step's headline. It has to declare its own width to be immune to that.
  it('takes the full width of a centring parent', () => {
    render(
      <div className="flex flex-col items-center">
        <FunnelStepTopBar skip={{ onClick: jest.fn() }} />
      </div>,
    );
    const strip = screen
      .getByRole('button', { name: 'Skip' })
      .closest('.sticky');

    expect(strip).toHaveClass('w-full');
  });

  it('renders no skip button unless one is given', () => {
    render(<FunnelStepTopBar />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the skip button with its label and handler', () => {
    const onClick = jest.fn();
    render(<FunnelStepTopBar skip={{ cta: 'Skip for now', onClick }} />);
    const skip = screen.getByRole('button', { name: 'Skip for now' });

    skip.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    // Browser default is submit; the funnel steps render inside forms.
    expect(skip).toHaveAttribute('type', 'button');
  });

  // `Logo`'s `linkDisabled` only adds `pointer-events-none`, so it keeps the
  // href and the tab stop — one Tab + Enter walked the user out of the funnel.
  // The mark is drawn as decoration instead.
  it('draws the logo as decoration, with no link to tab into', () => {
    render(<FunnelStepTopBar />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
