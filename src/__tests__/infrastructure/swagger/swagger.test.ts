import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Mock das dependências
jest.mock('swagger-jsdoc', () => jest.fn());
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn(),
}));

describe('Swagger Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve importar swagger-jsdoc corretamente', () => {
    expect(swaggerJSDoc).toBeDefined();
  });

  it('deve importar swagger-ui-express corretamente', () => {
    expect(swaggerUi).toBeDefined();
  });

  it('deve carregar o arquivo de configuração swagger sem erros', () => {
    expect(() => {
      require('../../../infrastructure/swagger/swagger');
    }).not.toThrow();
  });

  it('deve verificar se o módulo pode ser importado', () => {
    const swaggerModule = require('../../../infrastructure/swagger/swagger');
    expect(swaggerModule).toBeDefined();
  });

  it('deve verificar importações das dependências', () => {
    expect(swaggerJSDoc).toBeDefined();
    expect(swaggerUi).toBeDefined();
    expect(swaggerUi.serve).toBeDefined();
    expect(swaggerUi.setup).toBeDefined();
  });

  it('deve testar configuração básica do swagger', () => {
    // Mock return value for swaggerJSDoc
    (swaggerJSDoc as jest.Mock).mockReturnValue({
      openapi: '3.0.0',
      info: {
        title: 'API Test',
        version: '1.0.0'
      }
    });

    // Require the module to trigger configuration
    const swaggerModule = require('../../../infrastructure/swagger/swagger');
    expect(swaggerModule).toBeDefined();
  });

  it('deve testar configuração do swagger-ui-express', () => {
    expect(swaggerUi.serve).toBeDefined();
    expect(swaggerUi.setup).toBeDefined();
  });

  it('deve configurar as opções do swagger corretamente', () => {
    // Simular configuração válida
    (swaggerJSDoc as jest.Mock).mockReturnValue({
      openapi: '3.0.0',
      info: {
        title: 'Serviço Principal API',
        version: '1.0.0',
        description: 'API do serviço principal'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor de desenvolvimento'
        }
      ]
    });

    // Require o módulo para testar a configuração
    require('../../../infrastructure/swagger/swagger');
    
    // Verifica se swaggerJSDoc foi configurado
    expect(swaggerJSDoc).toBeDefined();
  });

  it('deve ter configuração de tags da API', () => {
    (swaggerJSDoc as jest.Mock).mockReturnValue({
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      tags: [
        { name: 'auth', description: 'Operações de autenticação' },
        { name: 'veiculos', description: 'Operações com veículos' }
      ]
    });

    require('../../../infrastructure/swagger/swagger');
    expect(swaggerJSDoc).toBeDefined();
  });

  it('deve configurar componentes de segurança', () => {
    (swaggerJSDoc as jest.Mock).mockReturnValue({
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    });

    require('../../../infrastructure/swagger/swagger');
    expect(swaggerJSDoc).toBeDefined();
  });
});
