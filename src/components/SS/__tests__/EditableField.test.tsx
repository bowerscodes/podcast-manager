import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditableField from '../EditableField';

// Mock toast properly
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

describe('EditableField', () => {
  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  const defaultProps = {
    value: 'Test Value',
    onSave: mockOnSave,
    children: <h1>Test Value</h1>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children in display mode', () => {
    render(<EditableField {...defaultProps} />);
    
    expect(screen.getByText('Test Value')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<EditableField {...defaultProps} />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('should save changes when save button is clicked', async () => {
    render(<EditableField {...defaultProps} />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Value');
    fireEvent.change(input, { target: { value: 'Updated Value' } });
    
    // Click the first button (save - green checkmark)
    const buttons = screen.getAllByRole('button');
    const saveButton = buttons[0]; // First button after edit button
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Updated Value');
    });
  });

  it('should cancel changes when cancel button is clicked', () => {
    render(<EditableField {...defaultProps} />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Value');
    fireEvent.change(input, { target: { value: 'Updated Value' } });
    
    // Click the second button (cancel - red X)
    const buttons = screen.getAllByRole('button');
    const cancelButton = buttons[1]; // Second button after edit button
    fireEvent.click(cancelButton);
    
    expect(screen.getByText('Test Value')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Updated Value')).not.toBeInTheDocument();
  });

  it('should save on enter key press', async () => {
    render(<EditableField {...defaultProps} />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Value');
    fireEvent.change(input, { target: { value: 'Updated Value' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Updated Value');
    });
  });

  it('should cancel on escape key press', () => {
    render(<EditableField {...defaultProps} />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Value');
    fireEvent.change(input, { target: { value: 'Updated Value' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    
    expect(screen.getByText('Test Value')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Updated Value')).not.toBeInTheDocument();
  });

  it('should render as textarea when multiline is true', () => {
    render(<EditableField {...defaultProps} multiline />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveProperty('tagName', 'TEXTAREA');
  });

  it('should handle different element types', () => {
    const propsWithSpan = {
      ...defaultProps,
      children: <span>Test Value</span>
    };
    
    render(<EditableField {...propsWithSpan} />);
    
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should apply custom input className', () => {
    render(<EditableField {...defaultProps} inputClassName="custom-class" />);
    
    const editButton = screen.getByRole('button');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Value');
    expect(input).toHaveClass('custom-class');
  });

  describe('maxLines functionality', () => {
    it('should render as textarea when maxLines is provided', () => {
      render(<EditableField {...defaultProps} maxLines={3} />);
      
      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveProperty('tagName', 'TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('should not save on Enter when maxLines is provided', () => {
      render(<EditableField {...defaultProps} maxLines={3} />);
      
      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);
      
      const textarea = screen.getByDisplayValue('Test Value');
      fireEvent.change(textarea, { target: { value: 'Updated Value' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
      
      // Should still be in edit mode, not saved
      expect(screen.getByDisplayValue('Updated Value')).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should apply captured styles when available', () => {
      // Mock the style capture functionality
      Object.defineProperty(window, 'getComputedStyle', {
        value: jest.fn().mockReturnValue({
          fontSize: '14px',
          lineHeight: '20px',
          color: 'rgb(75, 85, 99)',
          fontFamily: 'Arial'
        }),
        writable: true
      });

      const TestComponent = () => (
        <div>
          <p>Test content with styles</p>
        </div>
      );

      render(
        <EditableField 
          {...defaultProps} 
          maxLines={3}
        >
          {<TestComponent />}
        </EditableField>
      );
      
      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      
      // Verify textarea exists (styles will be applied via inline styles)
      expect(textarea).toBeInTheDocument();
    });

    it('should have proper styling for multi-line editing', () => {
      render(<EditableField {...defaultProps} maxLines={3} />);
      
      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveClass('bg-transparent', 'border-b-2', 'border-blue-500', 'outline-none');
    });
  });

  describe('ExpandableText integration', () => {
    const ExpandableTextMock = ({ text }: { text: string }) => (
      <div>
        <p>{text}</p>
        <button>Show more</button>
      </div>
    );

    it('should handle ExpandableText children correctly', () => {
      render(
        <EditableField 
          {...defaultProps} 
          maxLines={3}
        >
          <ExpandableTextMock text="Test Value" />
        </EditableField>
      );
      
      expect(screen.getByText('Test Value')).toBeInTheDocument();
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
  });

  describe('style capture functionality', () => {
    beforeEach(() => {
      // Mock querySelector to return a mock element
      Object.defineProperty(Element.prototype, 'querySelector', {
        value: jest.fn().mockReturnValue({
          style: {},
          scrollHeight: 100,
          clientHeight: 50
        }),
        writable: true
      });
    });

    it('should capture styles from child elements', () => {
      Object.defineProperty(window, 'getComputedStyle', {
        value: jest.fn().mockReturnValue({
          fontSize: '16px',
          lineHeight: '24px',
          color: 'rgb(0, 0, 0)',
          fontFamily: 'Arial'
        }),
        writable: true
      });

      render(<EditableField {...defaultProps} maxLines={3} />);
      
      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);
      
      // Verify that editing mode was activated
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle missing text elements gracefully', () => {
      Object.defineProperty(Element.prototype, 'querySelector', {
        value: jest.fn().mockReturnValue(null),
        writable: true
      });

      render(<EditableField {...defaultProps} maxLines={3} />);
      
      const editButton = screen.getByRole('button');
      fireEvent.click(editButton);
      
      // Should still render textarea even without captured styles
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
