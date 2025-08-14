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
});
