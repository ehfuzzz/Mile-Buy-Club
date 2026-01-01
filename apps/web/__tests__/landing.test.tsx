import { render, screen } from '@testing-library/react';
import Home from '../app/page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

describe('Landing page', () => {
  it('renders headline and CTAs', () => {
    render(<Home />);
    expect(screen.getByText(/Award flights, surfaced/i)).toBeInTheDocument();
    const ctas = screen.getAllByText(/Get started free/i);
    expect(ctas.length).toBeGreaterThan(0);
    const links = screen.getAllByRole('link', { name: /Get started free/i });
    links.forEach((link) => expect(link).toHaveAttribute('href', '/onboarding/chat'));
    expect(screen.getAllByText(/See live deals/i).length).toBeGreaterThan(0);
  });
});
