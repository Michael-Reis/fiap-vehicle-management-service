import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

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
