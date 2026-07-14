/**
 * Pull-to-refresh wiring shared by the Matches / Pools / Rankings tab roots.
 * No RNTL is installed in this repo, so we exercise the hook with the
 * react-test-renderer that the RN jest-preset already ships.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { RefreshControl } from 'react-native';
import { useRefreshControl } from '../RefreshControl';

function Probe(props: { refetch: () => unknown; refreshing: boolean }) {
  return useRefreshControl(props);
}

function renderProbe(refetch: () => unknown, refreshing: boolean) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<Probe refetch={refetch} refreshing={refreshing} />);
  });
  return renderer.root.findByType(RefreshControl);
}

describe('useRefreshControl', () => {
  it('calls refetch when the user pulls to refresh', () => {
    const refetch = jest.fn();
    const rc = renderProbe(refetch, false);

    act(() => {
      rc.props.onRefresh();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('reflects the react-query refetching state on the spinner', () => {
    expect(renderProbe(jest.fn(), true).props.refreshing).toBe(true);
    expect(renderProbe(jest.fn(), false).props.refreshing).toBe(false);
  });

  it('themes the spinner with the app primary color (not a default grey blob)', () => {
    const rc = renderProbe(jest.fn(), false);

    expect(rc.props.tintColor).toMatch(/^#/); // iOS
    expect(rc.props.colors).toEqual([rc.props.tintColor]); // Android arc matches iOS tint
  });
});
