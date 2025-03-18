import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders the loading spinner with default (medium) size', () => {
    render(<LoadingSpinner />);
    
    // Get the spinner element
    const spinner = document.querySelector('.w-8.h-8');
    expect(spinner).toBeInTheDocument();
    
    // Verify it has the animation class
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with small size when specified', () => {
    render(<LoadingSpinner size="small" />);
    
    const spinner = document.querySelector('.w-4.h-4');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('border-2');
  });

  it('renders with large size when specified', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinner = document.querySelector('.w-12.h-12');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('border-4');
  });
});
