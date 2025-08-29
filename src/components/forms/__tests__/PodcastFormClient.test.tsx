import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";

import PodcastFormClient from "@/components/forms/PodcastFormClient";

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
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn();

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
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle.mockResolvedValue({
              data: { id: "podcast-123", title: "Updated Podcast" },
              error: null,
            }),
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

jest.mock("@heroui/select", () => ({
  Select: ({
    label,
    children,
    value, 
    onSelectionChange, 
    selectionMode, 
    ...props
  }: {
    label?: string;
    children?: React.ReactNode;
    value?: string[];
    onSelectionChange?: (keys: Set<string>) => void;
    selectionMode?: "single" | "multiple";
    [key: string]: unknown;
  }) => (
    <div>
      <div>{label}</div>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
          onSelectionChange?.(new Set(selectedOptions));
        }}
        multiple={selectionMode === "multiple"}
        {...props}
      >
        {children}
      </select>
    </div>
  ),
  SelectItem: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <option value={children as string} {...props} >
      {children}
    </option>
  )
}));

jest.mock("@heroui/checkbox", () => ({
  Checkbox: ({
    isSelected, 
    onValueChange,
    children,
    ...props
  }: {
    isSelected?: boolean
    onValueChange?: (checked: boolean) => void;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <label>
      <input 
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onValueChange?.(e.target.checked)}
        {...props}
      />
      {children}
    </label>
  )
}));

describe("PodcastFormClient", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  
  const defaultProps = {
    initialData: {},
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all form fields", () => {
    render(<PodcastFormClient {...defaultProps} />);

    expect(screen.getByLabelText(/podcast title/i)).toBeTruthy();
    expect(screen.getByLabelText(/description/i)).toBeTruthy();
    expect(screen.getByLabelText(/categories/i)).toBeTruthy();
    expect(screen.getByLabelText(/author name/i)).toBeTruthy();
    expect(screen.getByLabelText(/contact email/i)).toBeTruthy();
    expect(screen.getByLabelText(/website/i)).toBeTruthy();
    expect(screen.getByLabelText(/artwork url/i)).toBeTruthy();
    expect(screen.getByLabelText(/explicit/i)).toBeTruthy();
  });

  it("should populate form with initial data", () => {
    const initialData = {
      title: "Test Podcast",
      description: "Test Description",
      categories: ["Business"],
      author: "Test Author",
      email: "test@example.com",
      website: "https://example.com",
      artwork: "https://example.com/art.jpg",
      explicit: false
    };

    render(<PodcastFormClient initialData={initialData} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(
      (screen.getByLabelText(/podcast title/i) as HTMLInputElement).value
    ).toBe("Test Podcast");
    expect(
      (screen.getByLabelText(/description/i) as HTMLTextAreaElement).value
    ).toBe("Test Description");
    expect(
      (screen.getByLabelText(/categories/i) as HTMLSelectElement).value
    ).toBe("Business");
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
    expect(
      (screen.getByLabelText(/explicit/i) as HTMLInputElement).checked
    ).toBe(false)
  });
  it("should update form fields when user types", () => {
    render(<PodcastFormClient {...defaultProps} />);

    const titleInput = screen.getByLabelText(
      /podcast title/i
    ) as HTMLInputElement;
    const explicitCheckbox = screen.getByLabelText(/explicit/i) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.click(explicitCheckbox);

    expect(titleInput.value).toBe("New Title");
    expect(explicitCheckbox.checked).toBe(true);
  });

  it("should submit form successfully in create mode", async () => {
    render(<PodcastFormClient {...defaultProps} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/podcast title/i), {
      target: { value: "Test Podcast" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/categories/i), {
      target: { value: ["Business"] },
    });
    fireEvent.change(screen.getByLabelText(/author name/i), {
      target: { value: "Test Author" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByLabelText(/explicit/i), {
      target: { checked: false }
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /create podcast/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        title: "Test Podcast",
        description: "Test Description",
        categories: ["Business"],
        author: "Test Author",
        email: "test@example.com",
        website: "",
        artwork: "",
        explicit: true,
        user_id: "user-123",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Podcast created successfully!"
      );
      expect(mockPush).toHaveBeenCalledWith("/podcasts/podcast-123");
    });
  });

  it("should submit form successfully in edit mode", async () => {
    const editProps = {
      initialData: {
        id: "podcast-123",
        title: "Existing Podcast",
        description: "Existing Description",
        categories: ["Technology"],
        author: "Existing Author",
        email: "existing@example.com",
        website: "https://existing.com",
        artwork: "https://existing.com/art.jpg",
        explicit: false
      },
      onSuccess: mockOnSuccess,
      onCancel: mockOnCancel,
    };

    render(<PodcastFormClient {...editProps} />);

    // Update form fields
    fireEvent.change(screen.getByLabelText(/podcast title/i), {
      target: { value: "Updated Podcast" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Updated Description" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /update podcast/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        title: "Updated Podcast",
        description: "Updated Description",
        categories: ["Technology"],
        author: "Existing Author",
        email: "existing@example.com",
        website: "https://existing.com",
        artwork: "https://existing.com/art.jpg",
        explicit: false
      });
      expect(mockEq).toHaveBeenCalledWith("id", "podcast-123");
      expect(toast.success).toHaveBeenCalledWith(
        "Podcast updated successfully!"
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle submission errors", async () => {
    // Mock an error response
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" },
    });

    render(<PodcastFormClient {...defaultProps} />);

    // Fill out required fields
    fireEvent.change(screen.getByLabelText(/podcast title/i), {
      target: { value: "Test Podcast" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/categories/i), {
      target: { value: ["Business"] },
    });
    fireEvent.change(screen.getByLabelText(/author name/i), {
      target: { value: "Test Author" },
    });
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/explicit/i), {
      target: { checked: false }
    })

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /create podcast/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create podcast");
    });
  });

  it("should call onCancel when cancel is clicked", () => {
    render(<PodcastFormClient {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("should handle form validation for required fields", () => {
    render(<PodcastFormClient {...defaultProps} />);

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
    render(<PodcastFormClient {...defaultProps} />);

    expect(screen.getByLabelText(/contact email/i).getAttribute("type")).toBe(
      "email"
    );
    expect(screen.getByLabelText(/website/i).getAttribute("type")).toBe("url");
    expect(screen.getByLabelText(/artwork url/i).getAttribute("type")).toBe(
      "url"
    );
  });
});
