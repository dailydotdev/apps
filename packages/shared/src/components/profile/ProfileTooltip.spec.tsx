import React from 'react';
import { render } from '@testing-library/react';
import { ProfileTooltip } from './ProfileTooltip';

const mockSimpleTooltipSpy = jest.fn();
const mockLinkWithTooltipSpy = jest.fn();

jest.mock('../tooltips/SimpleTooltip', () => ({
  SimpleTooltip: ({ children, ...props }) => {
    mockSimpleTooltipSpy({ children, ...props });
    return <div data-testid="simple-tooltip">{children}</div>;
  },
}));

jest.mock('../tooltips/LinkWithTooltip', () => ({
  LinkWithTooltip: ({ children, ...props }) => {
    mockLinkWithTooltipSpy({ children, ...props });
    return <a data-testid="link-with-tooltip">{children}</a>;
  },
}));

jest.mock('../cards/entity/UserEntityCard', () => ({
  __esModule: true,
  default: () => <div data-testid="user-entity-card" />,
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

    expect(mockSimpleTooltipSpy).toHaveBeenCalled();
    expect(mockSimpleTooltipSpy.mock.calls[0][0].trigger).toBe('mouseenter');
  });

  it('passes default trigger to LinkWithTooltip when link is provided', () => {
    render(
      <ProfileTooltip userId="user-1" link={{ href: '/u/test' }}>
        <span>child</span>
      </ProfileTooltip>,
    );

    expect(mockLinkWithTooltipSpy).toHaveBeenCalled();
    expect(mockLinkWithTooltipSpy.mock.calls[0][0].tooltip.trigger).toBe(
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

    expect(mockSimpleTooltipSpy).toHaveBeenCalled();
    expect(mockSimpleTooltipSpy.mock.calls[0][0].trigger).toBe('click');
  });
});
