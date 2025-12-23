import React from 'react';
import { render } from '@testing-library/react';
import { ProfileTooltip } from './ProfileTooltip';

const simpleTooltipSpy = jest.fn();
const linkWithTooltipSpy = jest.fn();

jest.mock('../tooltips/SimpleTooltip', () => ({
  SimpleTooltip: (props) => {
    simpleTooltipSpy(props);
    return <div data-testid="simple-tooltip">{props.children}</div>;
  },
}));

jest.mock('../tooltips/LinkWithTooltip', () => ({
  LinkWithTooltip: (props) => {
    linkWithTooltipSpy(props);
    return <a data-testid="link-with-tooltip">{props.children}</a>;
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isLoading: true }),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
}));

describe('ProfileTooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to mouseenter trigger when rendering SimpleTooltip', () => {
    render(
      <ProfileTooltip userId="user-1">
        <span>child</span>
      </ProfileTooltip>,
    );

    expect(simpleTooltipSpy).toHaveBeenCalled();
    expect(simpleTooltipSpy.mock.calls[0][0].trigger).toBe('mouseenter');
  });

  it('passes default trigger to LinkWithTooltip when link is provided', () => {
    render(
      <ProfileTooltip userId="user-1" link={{ href: '/u/test' }}>
        <span>child</span>
      </ProfileTooltip>,
    );

    expect(linkWithTooltipSpy).toHaveBeenCalled();
    expect(linkWithTooltipSpy.mock.calls[0][0].tooltip.trigger).toBe(
      'mouseenter',
    );
  });

  it('allows overriding trigger through tooltip props', () => {
    render(
      <ProfileTooltip
        userId="user-1"
        tooltip={{ trigger: 'click', placement: 'bottom' }}
      >
        <span>child</span>
      </ProfileTooltip>,
    );

    expect(simpleTooltipSpy).toHaveBeenCalled();
    expect(simpleTooltipSpy.mock.calls[0][0].trigger).toBe('click');
  });
});

