import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBlockNavigation } from './useBlockNavigation';

describe('useBlockNavigation', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should add event listener when shouldBlock is true', () => {
    renderHook(() => useBlockNavigation(true));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
  });

  it('should add event listener when shouldBlock is false', () => {
    renderHook(() => useBlockNavigation(false));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useBlockNavigation(true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
  });

  it('should call preventDefault when shouldBlock is true', () => {
    renderHook(() => useBlockNavigation(true));

    const eventListenerCall = addEventListenerSpy.mock.calls.find(
      (call: unknown[]) => call[0] === 'beforeunload',
    );
    expect(eventListenerCall).toBeDefined();

    const handler = eventListenerCall![1] as EventListener;
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as BeforeUnloadEvent;

    handler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should not call preventDefault when shouldBlock is false', () => {
    renderHook(() => useBlockNavigation(false));

    const eventListenerCall = addEventListenerSpy.mock.calls.find(
      (call: unknown[]) => call[0] === 'beforeunload',
    );
    expect(eventListenerCall).toBeDefined();

    const handler = eventListenerCall![1] as EventListener;
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as BeforeUnloadEvent;

    handler(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should update event listener when shouldBlock changes', () => {
    const { rerender } = renderHook(
      ({ shouldBlock }) => useBlockNavigation(shouldBlock),
      { initialProps: { shouldBlock: false } },
    );

    // Clear previous calls
    addEventListenerSpy.mockClear();
    removeEventListenerSpy.mockClear();

    // Change shouldBlock to true
    rerender({ shouldBlock: true });

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
  });
});
