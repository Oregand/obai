// jest.setup.js
import '@testing-library/jest-dom'

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/server and the Request/Response objects
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((body) => ({
        status: 200,
        body,
        headers: new Map(),
      })),
      redirect: jest.fn((url) => ({
        status: 302,
        headers: new Map([['Location', url]]),
      })),
    },
  };
});

// Define a minimal Request implementation for the test environment
global.Request = function MockRequest(url) {
  this.url = url || 'http://localhost';
  this.method = 'GET';
  this.headers = new Map();
};

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}))

// Setup for handling fetch mocks
global.fetch = jest.fn()

// Clean up between tests
afterEach(() => {
  jest.clearAllMocks()
})
