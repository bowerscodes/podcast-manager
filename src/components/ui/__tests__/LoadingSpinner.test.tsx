import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should have loading text', () => {
    render(<LoadingSpinner />);
    
    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('should display spinner animation', () => {
    render(<LoadingSpinner />);
    
    const spinnerContainer = screen.getByText(/loading/i).closest('div');
    expect(spinnerContainer).toHaveClass('p-8', 'text-center');
  });
});
