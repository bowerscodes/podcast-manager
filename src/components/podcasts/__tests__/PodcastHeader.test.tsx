import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import PodcastHeader from "@/components/podcasts/PodcastHeader";
import { Podcast } from "@/types/podcast";

// Mock the usePodcast hook
const mockRefresh = jest.fn();
jest.mock("@/hooks/usePodcast", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    podcast: null,
    loading: false,
    error: null,
    refresh: mockRefresh,
  })),
}));

// Mock the auth provider
jest.mock("@/components/auth/Provider", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

// Mock Supabase
const mockUpdate = jest.fn();
const mockEq = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })),
  },
}));

// Mock PodcastModal
jest.mock("@/components/modals/PodcastModal", () => {
  return function MockPodcastModal({
    isOpen,
    onClose,
    onSuccess,
    initialData,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData: Partial<Podcast>;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="podcast-modal">
        <div>Modal Title: {initialData?.title}</div>
        <button onClick={onSuccess} data-testid="form-success">
          Save
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// Mock EditableImage
jest.mock("@/components/ui/EditableImage", () => {
  return function MockEditableImage({
    src,
    alt,
    onSave,
    className,
  }: {
    src?: string;
    alt: string;
    onSave: (url: string) => Promise<void>;
    className?: string;
  }) {
    return (
      <div data-testid="editable-image" className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <button
          onClick={() => onSave("new-image-url.jpg")}
          data-testid="save-image"
        >
          Save Image
        </button>
      </div>
    );
  };
});

// Mock other UI components
jest.mock("@/components/ui/ExplicitTag", () => {
  return function MockExplicitTag({ isExplicit }: { isExplicit: boolean }) {
    return isExplicit ? <span data-testid="explicit-tag">Explicit</span> : null;
  };
});

jest.mock("@/components/ui/ExpandableText", () => {
  return function MockExpandableText({
    text,
    maxLines,
  }: {
    text: string;
    maxLines: number;
  }) {
    return (
      <div data-testid="expandable-text" data-max-lines={maxLines}>
        {text}
      </div>
    );
  };
});

// Mock HeroUI Button
jest.mock("@heroui/button", () => ({
  Button: ({
    children,
    onPress,
    variant,
    color,
    className,
    ...props
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: string;
    color?: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button
      onClick={onPress}
      className={className}
      data-variant={variant}
      data-color={color}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe("PodcastHeader", () => {
  const mockPodcast: Podcast = {
    id: "podcast-123",
    title: "Test Podcast",
    description: "This is a test podcast description that provides context.",
    author: "Test Author",
    email: "test@example.com",
    website: "https://example.com",
    artwork: "https://example.com/artwork.jpg",
    categories: ["Technology", "Education"],
    explicit: false,
    created_at: new Date("2025-01-01"),
    updated_at: new Date("2025-01-02"),
    user_id: "user-123",
    language: "",
  };

  const defaultProps = {
    podcast: mockPodcast,
    episodeCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render podcast information correctly", () => {
    render(<PodcastHeader {...defaultProps} />);

    expect(screen.getByText("Test Podcast")).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === "By Test Author";
    })).toBeInTheDocument();
    expect(screen.getByText("5 episodes")).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByTestId("expandable-text")).toHaveTextContent(
      "This is a test podcast description that provides context."
    );
  });

  it("should show explicit tag when podcast is explicit", () => {
    const explicitPodcast = { ...mockPodcast, explicit: true };
    render(<PodcastHeader podcast={explicitPodcast} episodeCount={3} />);

    expect(screen.getByTestId("explicit-tag")).toBeInTheDocument();
  });

  it("should not show explicit tag when podcast is not explicit", () => {
    render(<PodcastHeader {...defaultProps} />);

    expect(screen.queryByTestId("explicit-tag")).not.toBeInTheDocument();
  });

  it("should open edit modal when edit button is clicked", () => {
    render(<PodcastHeader {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByTestId("podcast-modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Title: Test Podcast")).toBeInTheDocument();
  });

  it("should close edit modal when close button is clicked", () => {
    render(<PodcastHeader {...defaultProps} />);

    // Open modal
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByTestId("podcast-modal")).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("podcast-modal")).not.toBeInTheDocument();
  });

  it("should handle podcast update and refresh", async () => {
    render(<PodcastHeader {...defaultProps} />);

    // Open modal
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    // Save changes - use more specific selector
    const saveButton = screen.getByTestId("form-success");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
      expect(screen.queryByTestId("podcast-modal")).not.toBeInTheDocument();
    });
  });

  it("should handle image update and refresh", async () => {
    render(<PodcastHeader {...defaultProps} />);

    const saveImageButton = screen.getByTestId("save-image");
    fireEvent.click(saveImageButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ artwork: "new-image-url.jpg" });
      expect(mockEq).toHaveBeenCalledWith("id", "podcast-123");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should render editable image with correct props", () => {
    render(<PodcastHeader {...defaultProps} />);

    const editableImage = screen.getByTestId("editable-image");
    expect(editableImage).toBeInTheDocument();
    expect(editableImage).toHaveClass("rounded-lg", "shadow-md");

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/artwork.jpg");
    expect(img).toHaveAttribute("alt", "Test Podcast artwork");
  });

  it("should handle different episode counts", () => {
    render(<PodcastHeader podcast={mockPodcast} episodeCount={1} />);
    expect(screen.getByText("1 episodes")).toBeInTheDocument();

    render(<PodcastHeader podcast={mockPodcast} episodeCount={0} />);
    expect(screen.getByText("0 episodes")).toBeInTheDocument();
  });

  it("should apply correct styling to edit button", () => {
    render(<PodcastHeader {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    expect(editButton).toHaveAttribute("data-variant", "light");
    expect(editButton).toHaveAttribute("data-color", "primary");
    expect(editButton).toHaveClass("top-0", "right-0", "z-10");
  });
});
