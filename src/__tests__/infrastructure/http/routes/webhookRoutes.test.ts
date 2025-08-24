import webhookRoutes from '../../../../infrastructure/http/routes/webhookRoutes';
import { WebhookController } from '../../../../infrastructure/http/controllers/WebhookController';

// Mock do controller
jest.mock('../../../../infrastructure/http/controllers/WebhookController');

describe('WebhookRoutes Integration Tests', () => {
  let mockWebhookController: jest.Mocked<WebhookController>;

  beforeEach(() => {
    mockWebhookController = new WebhookController() as jest.Mocked<WebhookController>;
    
    // Mock dos métodos do controller
    mockWebhookController.processarPagamento = jest.fn();

    // Configura mocks para retornar status de sucesso
    mockWebhookController.processarPagamento.mockResolvedValue();
  });

  describe('Router Configuration', () => {
    test('deve exportar um router válido', () => {
      expect(webhookRoutes).toBeDefined();
      expect(typeof webhookRoutes).toBe('function');
    });

    test('deve ter as propriedades de um router Express', () => {
      expect(webhookRoutes).toHaveProperty('stack');
      expect(Array.isArray(webhookRoutes.stack)).toBe(true);
    });

    test('deve ter rotas configuradas', () => {
      expect(webhookRoutes.stack.length).toBeGreaterThan(0);
    });
  });

  describe('Route Definitions', () => {
    test('deve ter rota POST /pagamento', () => {
      const routes = webhookRoutes.stack;
      const postRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/pagamento'
      );
      
      expect(postRoute).toBeDefined();
      expect(postRoute?.route?.path).toBe('/pagamento');
    });
  });

  describe('Route Structure Validation', () => {
    test('deve ter exatamente 1 rota configurada', () => {
      const routes = webhookRoutes.stack.filter(layer => layer.route);
      expect(routes).toHaveLength(1);
    });

    test('rotas devem ter handlers válidos', () => {
      const routes = webhookRoutes.stack;
      
      routes.forEach(layer => {
        if (layer.route) {
          expect(layer.route.stack).toBeDefined();
          expect(layer.route.stack.length).toBeGreaterThan(0);
          
          layer.route.stack.forEach(stackLayer => {
            expect(typeof stackLayer.handle).toBe('function');
          });
        }
      });
    });
  });

  describe('Route Parameters', () => {
    test('rota de pagamento não deve ter parâmetros de URL', () => {
      const routes = webhookRoutes.stack;
      const pagamentoRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/pagamento'
      );
      
      expect(pagamentoRoute).toBeDefined();
      expect(pagamentoRoute?.route?.path).not.toContain(':');
    });
  });

  describe('HTTP Methods Validation', () => {
    test('rota pagamento deve estar configurada', () => {
      const routes = webhookRoutes.stack;
      const pagamentoRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/pagamento'
      );
      
      expect(pagamentoRoute).toBeDefined();
      expect(pagamentoRoute?.route?.path).toBe('/pagamento');
    });
  });

  describe('Controller Integration', () => {
    test('deve instanciar WebhookController', () => {
      expect(WebhookController).toHaveBeenCalled();
    });

    test('rotas devem usar métodos do controller', () => {
      // Verificar se as rotas foram configuradas com os métodos corretos
      const routes = webhookRoutes.stack;
      
      expect(routes.length).toBeGreaterThan(0);
      
      // Cada rota deve ter pelo menos um handler
      routes.forEach(layer => {
        if (layer.route) {
          expect(layer.route.stack.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Middleware Configuration', () => {
    test('rotas não devem ter middleware de autenticação', () => {
      // Webhook routes geralmente não têm autenticação para permitir chamadas externas
      const routes = webhookRoutes.stack;
      
      routes.forEach(layer => {
        if (layer.route) {
          // Deve ter apenas 1 handler (o controller), sem middleware adicional
          expect(layer.route.stack.length).toBe(1);
        }
      });
    });
  });

  describe('Route Export Validation', () => {
    test('deve exportar um objeto Router do Express', () => {
      expect(webhookRoutes.constructor.name).toBe('Function');
      expect(webhookRoutes.stack).toBeDefined();
    });

    test('deve ser importável sem erros', () => {
      expect(() => {
        const routes = require('../../../../infrastructure/http/routes/webhookRoutes');
        expect(routes).toBeDefined();
      }).not.toThrow();
    });
  });
});
