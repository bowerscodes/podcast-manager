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
}));

// Mock Web APIs that aren't available in Node.js test environment
// We'll create a simpler mock that doesn't conflict with Next.js types

// Mock URL constructor for NextRequest
global.URL = global.URL || class MockURL {
  constructor(url, base) {
    if (base) {
      this.href = new URL(url, base).href;
    } else {
      this.href = url;
    }
    const parsed = new URL(this.href);
    this.protocol = parsed.protocol;
    this.hostname = parsed.hostname;
    this.port = parsed.port;
    this.pathname = parsed.pathname;
    this.search = parsed.search;
    this.hash = parsed.hash;
    this.origin = parsed.origin;
  }
};

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
      maybeSingle: jest.fn(),
      then: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithOtp: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
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
}));

// Mock server client
jest.mock('@/lib/createServiceClient', () => ({
  createServerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
  })),
}));

// Mock email utils (server actions)
jest.mock('@/lib/emailUtils', () => ({
  validateEmailDomain: jest.fn(),
  checkEmailDeliverability: jest.fn(),
}));

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
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));


// Only suppress the specific JSDOM navigation warning (this is acceptable)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0];
    
    // Only suppress JSDOM limitations - not React warnings
    if (
      typeof message === 'string' &&
      message.includes('Not implemented: navigation')
    ) {
      return;
    }
    
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
