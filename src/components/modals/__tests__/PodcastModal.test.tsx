import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import PodcastModal from "@/components/modals/PodcastModal";
import { Podcast } from "@/types/podcast";

// Mock PodcastForm (which wraps PodcastFormClient)
const mockOnSuccess = jest.fn();

jest.mock("@/components/forms/PodcastForm", () => {
  return function MockPodcastForm({
    initialData,
    onSuccess,
    onCancel,
  }: {
    initialData: Partial<Podcast>;
    onSuccess: () => void;
    onCancel: () => void;
  }) {
    const isEditing = Object.keys(initialData || {}).length > 0;
    return (
      <div data-testid="podcast-form">
        <div data-testid="form-header">
          {isEditing ? "Edit Podcast" : "Create Podcast"}
        </div>
        <div>Form Title: {initialData?.title || "New Podcast"}</div>
        <button onClick={onSuccess} data-testid="form-success">
          Success
        </button>
        <button onClick={onCancel} data-testid="form-cancel">
          Cancel
        </button>
      </div>
    );
  };
});

// Mock HeroUI Modal components
jest.mock("@heroui/modal", () => ({
  Modal: ({
    children,
    isOpen,
    onOpenChange,
    size,
    scrollBehavior,
    ...props
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    size?: string;
    scrollBehavior?: string;
    [key: string]: unknown;
  }) => {
    if (!isOpen) return null;
    return (
      <div
        data-testid="modal"
        data-size={size}
        data-scroll-behavior={scrollBehavior}
        {...props}
      >
        <div data-testid="modal-backdrop" onClick={() => onOpenChange(false)} />
        {children}
      </div>
    );
  },
  ModalContent: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="modal-content" {...props}>
      {children}
    </div>
  ),
  ModalHeader: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="modal-header" {...props}>
      {children}
    </div>
  ),
  ModalBody: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="modal-body" {...props}>
      {children}
    </div>
  ),
}));

describe("PodcastModal", () => {
  const mockPodcast: Partial<Podcast> = {
    id: "podcast-123",
    title: "Test Podcast",
    description: "Test Description",
    author: "Test Author",
    email: "test@example.com",
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: mockOnSuccess,
    initialData: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<PodcastModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(<PodcastModal {...defaultProps} />);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    expect(screen.getByTestId("podcast-form")).toBeInTheDocument();
  });

  it("should show 'Create Podcast' title for create mode", () => {
    render(<PodcastModal {...defaultProps} />);

    expect(screen.getByTestId("form-header")).toHaveTextContent("Create Podcast");
    expect(screen.getByText("Form Title: New Podcast")).toBeInTheDocument();
  });

  it("should show 'Edit Podcast' title for edit mode", () => {
    render(<PodcastModal {...defaultProps} initialData={mockPodcast} />);

    expect(screen.getByTestId("form-header")).toHaveTextContent("Edit Podcast");
    expect(screen.getByText("Form Title: Test Podcast")).toBeInTheDocument();
  });

  it("should apply correct modal size", () => {
    render(<PodcastModal {...defaultProps} />);

    const modal = screen.getByTestId("modal");
    expect(modal).toHaveAttribute("data-size", "2xl");
  });

  it("should call onClose when backdrop is clicked", () => {
    const mockOnClose = jest.fn();
    render(<PodcastModal {...defaultProps} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should handle form success", async () => {
    render(<PodcastModal {...defaultProps} />);

    const successButton = screen.getByTestId("form-success");
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle form cancel", async () => {
    const mockOnClose = jest.fn();
    render(<PodcastModal {...defaultProps} onClose={mockOnClose} />);

    const cancelButton = screen.getByTestId("form-cancel");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should pass correct props to PodcastForm", () => {
    render(<PodcastModal {...defaultProps} initialData={mockPodcast} />);

    expect(screen.getByTestId("podcast-form")).toBeInTheDocument();
    expect(screen.getByText("Form Title: Test Podcast")).toBeInTheDocument();
  });

  it("should handle empty initialData", () => {
    render(<PodcastModal {...defaultProps} initialData={{}} />);

    expect(screen.getByTestId("form-header")).toHaveTextContent("Create Podcast");
    expect(screen.getByText("Form Title: New Podcast")).toBeInTheDocument();
  });

  it("should handle undefined initialData", () => {
    render(<PodcastModal {...defaultProps} initialData={undefined} />);

    expect(screen.getByTestId("form-header")).toHaveTextContent("Create Podcast");
    expect(screen.getByText("Form Title: New Podcast")).toBeInTheDocument();
  });
});
