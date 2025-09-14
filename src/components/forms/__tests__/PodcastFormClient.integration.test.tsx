import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";

import PodcastFormClient from "@/components/forms/PodcastFormClient";
import { supabase } from "@/lib/supabase";

// Mock external dependencies but NOT Supabase to test actual database operations
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/providers/Providers", () => ({
  useAuth: () => ({
    user: {
      id: "user-123",
      email: "test@example.com",
    },
  }),
}));

// Mock HeroUI components with proper TypeScript types
interface MockInputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: unknown;
}

interface MockTextareaProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  [key: string]: unknown;
}

interface MockSelectProps {
  label?: string;
  value?: string[] | string;
  onSelectionChange?: (keys: Set<string>) => void;
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface MockCheckboxProps {
  children?: React.ReactNode;
  isSelected?: boolean;
  onValueChange?: (checked: boolean) => void;
  [key: string]: unknown;
}

interface MockButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  isLoading?: boolean;
  [key: string]: unknown;
}

jest.mock("@heroui/button", () => ({
  Button: ({ children, onPress, isLoading, ...props }: MockButtonProps) => (
    <button onClick={onPress} disabled={isLoading} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@heroui/input", () => ({
  Input: ({ label, value, onChange, ...props }: MockInputProps) => (
    <input
      placeholder={label}
      value={value}
      onChange={onChange}
      data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      {...props}
    />
  ),
  Textarea: ({ label, value, onChange, ...props }: MockTextareaProps) => (
    <textarea
      placeholder={label}
      value={value}
      onChange={onChange}
      data-testid={`textarea-${label?.toLowerCase()}`}
      {...props}
    />
  ),
}));

jest.mock("@heroui/select", () => ({
  Select: ({ label, value, onSelectionChange, children, ...props }: MockSelectProps) => (
    <select
      value={Array.isArray(value) ? value.join(",") : value}
      onChange={(e) => {
        const values = e.target.value ? e.target.value.split(",") : [];
        onSelectionChange?.(new Set(values));
      }}
      data-testid={`select-${label?.toLowerCase()}`}
      {...props}
    >
      {children}
    </select>
  ),
  SelectItem: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <option {...props}>{children}</option>
  ),
}));

jest.mock("@heroui/checkbox", () => ({
  Checkbox: ({ children, isSelected, onValueChange, ...props }: MockCheckboxProps) => (
    <label>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onValueChange?.(e.target.checked)}
        data-testid="checkbox-explicit"
        {...props}
      />
      {children}
    </label>
  ),
}));

const TEST_USERNAME = "user1";
const TEST_PODCAST_NAME = "new-podcast";

jest.mock("@/lib/supabase", () => ({
  __esModule: true,
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe("PodcastFormClient Integration Tests", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe("Create Mode - Database Integration", () => {
    it("should successfully create a podcast without passing empty id to Supabase", async () => {
      // Mock successful Supabase insert and profiles lookup
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: "podcast-456", title: "New Podcast", podcast_name: TEST_PODCAST_NAME },
            error: null,
          }),
        }),
      });
      const mockProfiles = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: "user-123", username: TEST_USERNAME },
              error: null,
            }),
          })),
        })),
      };
      // Save original
      const originalFrom = supabase.from;
      // Replace with our mock
      // @ts-expect-error test mock
      supabase.from = (table: string) => {
        if (table === "profiles") return mockProfiles;
        if (table === "podcasts") return { insert: mockInsert };
        return {};
      };

      render(
        <PodcastFormClient
          initialData={{}}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill out the form
      fireEvent.change(screen.getByTestId("input-podcast-title"), {
        target: { value: "New Podcast" },
      });
      fireEvent.change(screen.getByTestId("textarea-description"), {
        target: { value: "New Description" },
      });
      fireEvent.change(screen.getByTestId("input-author-name"), {
        target: { value: "New Author" },
      });
      fireEvent.change(screen.getByTestId("input-contact-email"), {
        target: { value: "author@example.com" },
      });

      // Submit the form
      fireEvent.click(screen.getByText("Create Podcast"));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith({
          title: "New Podcast",
          description: "New Description",
          author: "New Author",
          email: "author@example.com",
          website: "",
          artwork: "",
          categories: [],
          explicit: false,
          user_id: "user-123",
          podcast_name: TEST_PODCAST_NAME,
        });
      });

      // Verify that id field is NOT included in the insert data
      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall).not.toHaveProperty("id");

      expect(toast.success).toHaveBeenCalledWith("Podcast created successfully!");
      expect(mockPush).toHaveBeenCalledWith(`/${TEST_USERNAME}/${TEST_PODCAST_NAME}`);

      // Restore original
      supabase.from = originalFrom;
    });

    it("should not include empty string id in create operation", async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: "podcast-789", title: "Another Podcast" },
            error: null,
          }),
        }),
      });

      const originalFrom = supabase.from;
      // @ts-expect-error test mock
      supabase.from = () => ({
        insert: mockInsert,
      });

      // Pass empty string id to simulate the bug scenario
      render(
        <PodcastFormClient
          initialData={{ id: "" }}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByTestId("input-podcast-title"), {
        target: { value: "Another Podcast" },
      });
      fireEvent.change(screen.getByTestId("textarea-description"), {
        target: { value: "Another Description" },
      });
      fireEvent.change(screen.getByTestId("input-author-name"), {
        target: { value: "Another Author" },
      });
      fireEvent.change(screen.getByTestId("input-contact-email"), {
        target: { value: "another@example.com" },
      });

      fireEvent.click(screen.getByText("Create Podcast"));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled();
      });

      // Verify that id field is NOT included even when initialData.id is empty string
      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall).not.toHaveProperty("id");

      supabase.from = originalFrom;
    });

    it("should handle Supabase UUID validation error gracefully", async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue({
            error: {
              message: "invalid input syntax for type uuid",
              code: "22P02",
            },
          }),
        }),
      });

      const originalFrom = supabase.from;
      // @ts-expect-error test mock
      supabase.from = () => ({
        insert: mockInsert,
      });

      render(
        <PodcastFormClient
          initialData={{}}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByTestId("input-podcast-title"), {
        target: { value: "Test Podcast" },
      });
      fireEvent.change(screen.getByTestId("textarea-description"), {
        target: { value: "Test Description" },
      });
      fireEvent.change(screen.getByTestId("input-author-name"), {
        target: { value: "Test Author" },
      });
      fireEvent.change(screen.getByTestId("input-contact-email"), {
        target: { value: "test@example.com" },
      });

      fireEvent.click(screen.getByText("Create Podcast"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to create podcast");
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();

      supabase.from = originalFrom;
    });
  });

  describe("Edit Mode - Database Integration", () => {
    const existingPodcast = {
      id: "podcast-123",
      title: "Existing Podcast",
      description: "Existing Description",
      author: "Existing Author",
      email: "existing@example.com",
      website: "https://existing.com",
      artwork: "https://artwork.com/image.jpg",
      categories: ["Technology"],
      explicit: true,
    };

    it("should successfully update an existing podcast", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...existingPodcast, title: "Updated Podcast" },
              error: null,
            }),
          }),
        }),
      });

      const originalFrom = supabase.from;
      // @ts-expect-error test mock
      supabase.from = () => ({
        update: mockUpdate,
      });

      render(
        <PodcastFormClient
          initialData={existingPodcast}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Update the title
      fireEvent.change(screen.getByTestId("input-podcast-title"), {
        target: { value: "Updated Podcast" },
      });

      fireEvent.click(screen.getByText("Update Podcast"));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          title: "Updated Podcast",
          description: "Existing Description",
          author: "Existing Author",
          email: "existing@example.com",
          website: "https://existing.com",
          artwork: "https://artwork.com/image.jpg",
          categories: ["Technology"],
          explicit: true,
          podcast_name: "existing-podcast",
        });
      });

      expect(toast.success).toHaveBeenCalledWith("Podcast updated successfully!");
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled(); // Should not redirect on update

      // test mock restore
      supabase.from = originalFrom;
    });

    it("should handle update errors gracefully", async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue({
              error: { message: "Update failed" },
            }),
          }),
        }),
      });

      const originalFrom = supabase.from;
      // @ts-expect-error test mock
      supabase.from = () => ({
        update: mockUpdate,
      });

      render(
        <PodcastFormClient
          initialData={existingPodcast}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText("Update Podcast"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to update podcast");
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();

      supabase.from = originalFrom;
    });
  });

  describe("Form State Management", () => {
    it("should properly detect edit mode based on initialData.id", () => {
      const { rerender } = render(
        <PodcastFormClient
          initialData={{}}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Create Podcast")).toBeInTheDocument();

      rerender(
        <PodcastFormClient
          initialData={{ id: "podcast-123" }}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Update Podcast")).toBeInTheDocument();
    });

    it("should treat empty string id as create mode", () => {
      render(
        <PodcastFormClient
          initialData={{ id: "" }}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Create Podcast")).toBeInTheDocument();
    });

    it("should treat whitespace-only id as create mode", () => {
      render(
        <PodcastFormClient
          initialData={{ id: "   " }}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Create Podcast")).toBeInTheDocument();
    });
  });
});
