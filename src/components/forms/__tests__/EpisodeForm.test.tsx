import { render, screen } from '@testing-library/react';
import EpisodeForm from '../EpisodeForm';
import { Episode } from '@/types/podcast';

// Mock EpisodeFormClient
jest.mock('../EpisodeFormClient', () => {
  return function MockEpisodeFormClient({ 
    podcastId, 
    initialData, 
    onSuccess, 
    onCancel 
  }: { 
    podcastId: string; 
    initialData?: Partial<Episode>; 
    onSuccess: () => void; 
    onCancel: () => void; 
  }) {
    return (
      <div data-testid="episode-form-client">
        <span data-testid="podcast-id">{podcastId}</span>
        <span data-testid="initial-data">{JSON.stringify(initialData)}</span>
        <button onClick={onSuccess}>Success</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

// Mock HeroUI components
jest.mock('@heroui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardBody: ({ children }: { children: React.ReactNode }) => <div data-testid="card-body">{children}</div>,
}));

describe('EpisodeForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    podcastId: 'podcast-123',
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render card with header and body', () => {
    render(<EpisodeForm {...defaultProps} />);

    expect(screen.getByTestId('card')).toBeTruthy();
    expect(screen.getByTestId('card-header')).toBeTruthy();
    expect(screen.getByTestId('card-body')).toBeTruthy();
  });

  it('should show "Add Episode" header when no initial data', () => {
    render(<EpisodeForm {...defaultProps} />);

    expect(screen.getByText('Add Episode')).toBeTruthy();
  });

  it('should show "Edit Episode" header when initial data provided', () => {
    const initialData = {
      id: 'episode-123',
      title: 'Test Episode',
    };

    render(<EpisodeForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByText('Edit Episode')).toBeTruthy();
  });

  it('should pass podcastId to form client', () => {
    render(<EpisodeForm {...defaultProps} podcastId="specific-podcast-123" />);

    expect(screen.getByTestId('podcast-id')).toHaveTextContent('specific-podcast-123');
  });

  it('should pass initialData to form client', () => {
    const initialData = {
      id: 'episode-123',
      title: 'Test Episode',
      description: 'Test Description',
    };

    render(<EpisodeForm {...defaultProps} initialData={initialData} />);

    const initialDataElement = screen.getByTestId('initial-data');
    expect(initialDataElement.textContent).toContain('episode-123');
    expect(initialDataElement.textContent).toContain('Test Episode');
  });

  it('should pass empty object as initialData when none provided', () => {
    render(<EpisodeForm {...defaultProps} />);

    const initialDataElement = screen.getByTestId('initial-data');
    expect(initialDataElement.textContent).toBe('{}');
  });

  it('should render form client component', () => {
    render(<EpisodeForm {...defaultProps} />);

    expect(screen.getByTestId('episode-form-client')).toBeTruthy();
  });

  it('should handle success callback', () => {
    render(<EpisodeForm {...defaultProps} />);

    const successButton = screen.getByText('Success');
    successButton.click();

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle cancel callback', () => {
    render(<EpisodeForm {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should apply correct header styling', () => {
    render(<EpisodeForm {...defaultProps} />);

    const header = screen.getByText('Add Episode');
    expect(header.className).toContain('heading-secondary');
  });

  describe('isEditing detection', () => {
    it('should detect editing when initialData has properties', () => {
      const initialData = {
        title: 'Test Episode',
      };

      render(<EpisodeForm {...defaultProps} initialData={initialData} />);

      expect(screen.getByText('Edit Episode')).toBeTruthy();
    });

    it('should detect creating when initialData is empty object', () => {
      render(<EpisodeForm {...defaultProps} initialData={{}} />);

      expect(screen.getByText('Add Episode')).toBeTruthy();
    });

    it('should detect creating when no initialData provided', () => {
      render(<EpisodeForm {...defaultProps} />);

      expect(screen.getByText('Add Episode')).toBeTruthy();
    });
  });
});
