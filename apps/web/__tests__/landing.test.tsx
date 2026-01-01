import { render, screen } from '@testing-library/react';
import Home from '../app/page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

describe('Landing page', () => {
  it('renders headline and CTAs', () => {
    render(<Home />);
    expect(screen.getByText(/Award flights, surfaced/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Get started free/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/See live deals/i).length).toBeGreaterThan(0);
  });
});

