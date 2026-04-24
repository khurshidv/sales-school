import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import FunnelStepper from './FunnelStepper';

afterEach(() => {
  cleanup();
});

describe('FunnelStepper', () => {
  it('renders 4 circles with correct states', () => {
    render(<FunnelStepper currentLesson={2} completedLessons={[1]} />);
    const el1 = screen.getByLabelText(/Dars 1/i);
    const el2 = screen.getByLabelText(/Dars 2/i);
    const el3 = screen.getByLabelText(/Dars 3/i);
    const el4 = screen.getByLabelText(/Dars 4/i);
    expect(el1.getAttribute('aria-current')).toBe('false');
    expect(el2.getAttribute('aria-current')).toBe('step');
    expect(el3.getAttribute('aria-disabled')).toBe('true');
    expect(el4.getAttribute('aria-disabled')).toBe('true');
  });
});
