// Setup global para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';

// Mock console para reduzir logs durante os testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Timeout padrão para testes assíncronos
jest.setTimeout(10000);

// Teste dummy para evitar erro do Jest
describe('Setup', () => {
  it('should setup test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
