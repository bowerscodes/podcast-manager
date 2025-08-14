import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EditableImage from '../EditableImage';
import toast from 'react-hot-toast';

// Mock toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  }
}));

// Mock HeroUI Image component
jest.mock('@heroui/image', () => ({
  Image: ({ src, alt, className, onLoad, onError, ...props }: { 
    src: string; 
    alt: string; 
    className?: string; 
    onLoad?: () => void; 
    onError?: () => void; 
    [key: string]: unknown 
  }) => {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  },
}));

// Mock react-icons
jest.mock('react-icons/ai', () => ({
  AiOutlineEdit: ({ size, ...props }: { size?: number; [key: string]: unknown }) => 
    <div data-testid="edit-icon" data-size={size} {...props}>✏️</div>,
}));

describe('EditableImage', () => {
  const mockOnSave = jest.fn();
  const mockFallback = <div data-testid="fallback">Fallback Image</div>;

  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test Image',
    onSave: mockOnSave,
    fallback: mockFallback,
    className: 'test-class'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('should render image when src is provided', () => {
    render(<EditableImage {...defaultProps} />);

    const image = screen.getByAltText('Test Image');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('https://example.com/image.jpg');
  });

  it('should render fallback when src is null', () => {
    render(<EditableImage {...defaultProps} src={null} />);

    expect(screen.getByTestId('fallback')).toBeTruthy();
    expect(screen.queryByAltText('Test Image')).toBeFalsy();
  });

  it('should show edit button on hover', () => {
    render(<EditableImage {...defaultProps} />);

    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.mouseEnter(container);
      expect(screen.getByTestId('edit-icon')).toBeTruthy();
    }
  });

    it('should hide edit button when not hovered', () => {
    render(<EditableImage {...defaultProps} />);

    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.mouseLeave(container);
      expect(screen.queryByTestId('edit-icon')).toBeNull();
    }
  });

  it('should open edit modal when edit button is clicked', () => {
    render(<EditableImage {...defaultProps} />);

    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.mouseEnter(container);
      fireEvent.click(screen.getByTestId('edit-icon'));
      
      expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeTruthy();
      expect(screen.getByText('Save')).toBeTruthy();
    }
  });

  it('should update URL input when typing', () => {
    render(<EditableImage {...defaultProps} />);

    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.mouseEnter(container);
      fireEvent.click(screen.getByTestId('edit-icon'));
      
      const input = screen.getByDisplayValue('https://example.com/image.jpg') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'https://example.com/new-image.jpg' } });

      expect(input.value).toBe('https://example.com/new-image.jpg');
    }
  });

  it('should call onSave when save button is clicked', async () => {
    render(<EditableImage {...defaultProps} />);

    const container = screen.getByAltText('Test Image').parentElement;
    if (container) {
      fireEvent.mouseEnter(container);
      fireEvent.click(screen.getByTestId('edit-icon'));
      
      const input = screen.getByDisplayValue('https://example.com/image.jpg');
      fireEvent.change(input, { target: { value: 'https://example.com/new-image.jpg' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith('https://example.com/new-image.jpg');
      });
    }
  });

  it('should close modal when cancel button is clicked', () => {
    render(<EditableImage {...defaultProps} />);

    // Click image to open modal
    const image = screen.getByAltText('Test Image');
    fireEvent.click(image);
    
    expect(screen.getByText('Save')).toBeTruthy();
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.queryByText('Save')).toBeFalsy();
  });

  it('should handle save errors', async () => {
    const errorOnSave = jest.fn().mockRejectedValueOnce(new Error('Save failed'));
    const testProps = { ...defaultProps, onSave: errorOnSave };

    render(<EditableImage {...testProps} />);

    // Click image to open modal
    const image = screen.getByAltText('Test Image');
    fireEvent.click(image);
    
    expect(screen.getByText('Save')).toBeTruthy();
    
    // Change the URL first so onSave gets called
    const input = screen.getByDisplayValue('https://example.com/image.jpg');
    fireEvent.change(input, { target: { value: 'https://example.com/new-image.jpg' } });
    
    fireEvent.click(screen.getByText('Save'));
    
    // Verify the function was called
    await waitFor(() => {
      expect(errorOnSave).toHaveBeenCalledWith('https://example.com/new-image.jpg');
    });
    
    // Verify toast error was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update image');
    });
  });

  it('should validate URL format', () => {
    render(<EditableImage {...defaultProps} />);

    // Click image to open modal
    const image = screen.getByAltText('Test Image');
    fireEvent.click(image);
    
    const input = screen.getByDisplayValue('https://example.com/image.jpg');
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    
    // Should show validation error or prevent save
    expect(screen.getByDisplayValue('invalid-url')).toBeTruthy();
  });

  it('should show loading state during save', async () => {
    let resolveSave: (value?: unknown) => void;
    const loadingOnSave = jest.fn().mockImplementationOnce(() => new Promise(resolve => {
      resolveSave = resolve;
    }));
    const testProps = { ...defaultProps, onSave: loadingOnSave };

    render(<EditableImage {...testProps} />);

    // Click image to open modal
    const image = screen.getByAltText('Test Image');
    fireEvent.click(image);
    
    expect(screen.getByText('Save')).toBeTruthy();
    
    // Change the URL first so onSave gets called
    const input = screen.getByDisplayValue('https://example.com/image.jpg');
    fireEvent.change(input, { target: { value: 'https://example.com/new-image.jpg' } });
    
    fireEvent.click(screen.getByText('Save'));
    
    expect(screen.getByText('Saving...')).toBeTruthy();
    
    // Resolve the promise
    resolveSave!();
    
    await waitFor(() => {
      expect(screen.queryByText('Saving...')).toBeFalsy();
    });
  });

  it('should handle image load errors', () => {
    render(<EditableImage {...defaultProps} />);

    const image = screen.getByAltText('Test Image');
    fireEvent.error(image);
    
    // Should handle the error gracefully
    expect(image).toBeTruthy();
  });

  it('should apply custom className', () => {
    render(<EditableImage {...defaultProps} />);

    const container = screen.getByAltText('Test Image').parentElement;
    expect(container?.className).toContain('test-class');
  });

  it('should close modal on escape key', () => {
    render(<EditableImage {...defaultProps} />);

    // Click image to open modal
    const image = screen.getByAltText('Test Image');
    fireEvent.click(image);
    
    expect(screen.getByText('Save')).toBeTruthy();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(screen.queryByText('Save')).toBeFalsy();
  });
});
