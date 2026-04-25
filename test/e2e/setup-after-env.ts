// Ensure NODE_ENV is set to test before any test runs
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test';
}

jest.setTimeout(30_000);

afterEach(() => {
  jest.clearAllMocks();
});
