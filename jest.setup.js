import '@testing-library/jest-dom'

// The above import automatically extends Jest with DOM testing matchers
// No need to manually extend

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      then: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
  },
  supabaseServiceRole: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}))

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Card: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardBody: ({ children, ...props }) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  Input: ({ ...props }) => <input {...props} />,
  Modal: ({ children, isOpen, ...props }) => isOpen ? <div {...props}>{children}</div> : null,
  ModalContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalBody: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalFooter: ({ children, ...props }) => <div {...props}>{children}</div>,
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onOpenChange: jest.fn(),
  }),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}))
