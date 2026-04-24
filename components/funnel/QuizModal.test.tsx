import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import QuizModal from './QuizModal';

afterEach(() => {
  cleanup();
});

const quiz = {
  lesson: 1 as const,
  question: 'Q?',
  options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
  correctIndex: 1 as const,
};

describe('QuizModal', () => {
  it('renders question and options', () => {
    render(<QuizModal quiz={quiz} onSubmit={vi.fn().mockResolvedValue(true)} onBack={vi.fn()} />);
    expect(screen.queryByText('Q?')).not.toBeNull();
    expect(screen.queryByText('A')).not.toBeNull();
    expect(screen.queryByText('D')).not.toBeNull();
  });

  it('calls onSubmit with selected index when Submit clicked', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<QuizModal quiz={quiz} onSubmit={onSubmit} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('B'));
    fireEvent.click(screen.getByRole('button', { name: /Javobni yuborish/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith(1);
  });

  it('shows "wrong" message on failed submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    render(<QuizModal quiz={quiz} onSubmit={onSubmit} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByRole('button', { name: /Javobni yuborish/i }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeNull());
    expect(screen.getByRole('alert').textContent).toMatch(/Qayta urinib/);
  });
});
