import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import NewPodcastFormClient from "@/components/forms/NewPodcastFormClient";

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock auth provider
jest.mock("@/providers/Providers", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@example.com" },
  }),
}));

// Mock Supabase
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockResolvedValue({
            data: { id: "podcast-123", title: "Test Podcast" },
            error: null,
          }),
        }),
      }),
    })),
  },
}));

// Mock HeroUI components
jest.mock("@heroui/button", () => ({
  Button: ({
    children,
    onPress,
    type,
    isLoading,
    ...props
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    isLoading?: boolean;
    [key: string]: unknown;
  }) => (
    <button onClick={onPress} type={type} disabled={isLoading} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@heroui/input", () => ({
  Input: ({
    label,
    value,
    onChange,
    ...props
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: unknown;
  }) => (
    <div>
      <label>{label}</label>
      <input aria-label={label} value={value} onChange={onChange} {...props} />
    </div>
  ),
  Textarea: ({
    label,
    value,
    onChange,
    rows,
    ...props
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    [key: string]: unknown;
  }) => (
    <div>
      <label>{label}</label>
      <textarea
        aria-label={label}
        value={value}
        onChange={onChange}
        rows={rows}
        {...props}
      />
    </div>
  ),
}));

describe("NewPodcastFormClient", () => {
  const defaultProps = {
    initialData: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<NewPodcastFormClient {...defaultProps} />);

    expect(screen.getByLabelText(/podcast title/i)).toBeTruthy();
    expect(screen.getByLabelText(/description/i)).toBeTruthy();
    expect(screen.getByLabelText(/author name/i)).toBeTruthy();
    expect(screen.getByLabelText(/contact email/i)).toBeTruthy();
    expect(screen.getByLabelText(/website/i)).toBeTruthy();
    expect(screen.getByLabelText(/artwork url/i)).toBeTruthy();
  });

  it("should populate form with initial data", () => {
    const initialData = {
      title: "Test Podcast",
      description: "Test Description",
      author: "Test Author",
      email: "test@example.com",
      website: "https://example.com",
      artwork: "https://example.com/art.jpg",
    };

    render(<NewPodcastFormClient initialData={initialData} />);

    expect(
      (screen.getByLabelText(/podcast title/i) as HTMLInputElement).value
    ).toBe("Test Podcast");
    expect(
      (screen.getByLabelText(/description/i) as HTMLTextAreaElement).value
    ).toBe("Test Description");
    expect(
      (screen.getByLabelText(/author name/i) as HTMLInputElement).value
    ).toBe("Test Author");
    expect(
      (screen.getByLabelText(/contact email/i) as HTMLInputElement).value
    ).toBe("test@example.com");
    expect((screen.getByLabelText(/website/i) as HTMLInputElement).value).toBe(
      "https://example.com"
    );
    expect(
      (screen.getByLabelText(/artwork url/i) as HTMLInputElement).value
    ).toBe("https://example.com/art.jpg");
  });
  it("should update form fields when user types", () => {
    render(<NewPodcastFormClient {...defaultProps} />);

    const titleInput = screen.getByLabelText(
      /podcast title/i
    ) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "New Title" } });

    expect(titleInput.value).toBe("New Title");
  });

  it("should submit form successfully", async () => {
    render(<NewPodcastFormClient {...defaultProps} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/podcast title/i), {
      target: { value: "Test Podcast" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/author name/i), {
      target: { value: "Test Author" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /create podcast/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        title: "Test Podcast",
        description: "Test Description",
        author: "Test Author",
        email: "test@example.com",
        website: "",
        artwork: "",
        explicit: false,
        user_id: "user-123",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Podcast created successfully!"
      );
      expect(mockPush).toHaveBeenCalledWith("/podcasts/podcast-123");
    });
  });

  it("should handle submission errors", async () => {
    // Mock an error response
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" },
    });

    render(<NewPodcastFormClient {...defaultProps} />);

    // Fill out required fields
    fireEvent.change(screen.getByLabelText(/podcast title/i), {
      target: { value: "Test Podcast" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/author name/i), {
      target: { value: "Test Author" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /create podcast/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create podcast");
    });
  });

  it("should navigate back when cancel is clicked", () => {
    render(<NewPodcastFormClient {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockBack).toHaveBeenCalled();
  });

  it("should handle form validation for required fields", () => {
    render(<NewPodcastFormClient {...defaultProps} />);

    const titleInput = screen.getByLabelText(/podcast title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const authorInput = screen.getByLabelText(/author name/i);
    const emailInput = screen.getByLabelText(/contact email/i);

    expect(titleInput.hasAttribute("required")).toBe(true);
    expect(descriptionInput.hasAttribute("required")).toBe(true);
    expect(authorInput.hasAttribute("required")).toBe(true);
    expect(emailInput.hasAttribute("required")).toBe(true);
  });

  it("should set correct input types", () => {
    render(<NewPodcastFormClient {...defaultProps} />);

    expect(screen.getByLabelText(/contact email/i).getAttribute("type")).toBe(
      "email"
    );
    expect(screen.getByLabelText(/website/i).getAttribute("type")).toBe("url");
    expect(screen.getByLabelText(/artwork url/i).getAttribute("type")).toBe(
      "url"
    );
  });
});
