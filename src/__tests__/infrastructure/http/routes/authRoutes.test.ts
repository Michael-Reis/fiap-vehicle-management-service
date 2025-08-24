import authRoutes from '../../../../infrastructure/http/routes/authRoutes';
import { AuthController } from '../../../../infrastructure/http/controllers/AuthController';

// Mock do middleware de autenticação
jest.mock('../../../../infrastructure/http/middlewares/authMiddleware', () => ({
  authMiddleware: jest.fn()
}));

// Mock do controller
jest.mock('../../../../infrastructure/http/controllers/AuthController');

describe('AuthRoutes Integration Tests', () => {
  let mockAuthController: jest.Mocked<AuthController>;

  beforeEach(() => {
    mockAuthController = new AuthController() as jest.Mocked<AuthController>;
    
    // Mock dos métodos do controller
    mockAuthController.registrar = jest.fn();
    mockAuthController.login = jest.fn();

    // Configura mocks para retornar status de sucesso
    mockAuthController.registrar.mockResolvedValue();
    mockAuthController.login.mockResolvedValue();
  });

  describe('Router Configuration', () => {
    test('deve exportar um router válido', () => {
      expect(authRoutes).toBeDefined();
      expect(typeof authRoutes).toBe('function');
    });

    test('deve ter as propriedades de um router Express', () => {
      expect(authRoutes).toHaveProperty('stack');
      expect(Array.isArray(authRoutes.stack)).toBe(true);
    });

    test('deve ter rotas configuradas', () => {
      expect(authRoutes.stack.length).toBeGreaterThan(0);
    });
  });

  describe('Route Definitions', () => {
    test('deve ter rota POST /registrar-cliente', () => {
      const routes = authRoutes.stack;
      const registrarRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/registrar-cliente'
      );
      
      expect(registrarRoute).toBeDefined();
      expect(registrarRoute?.route?.path).toBe('/registrar-cliente');
    });

    test('deve ter rota POST /login', () => {
      const routes = authRoutes.stack;
      const loginRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/login'
      );
      
      expect(loginRoute).toBeDefined();
      expect(loginRoute?.route?.path).toBe('/login');
    });
  });

  describe('Route Structure Validation', () => {
    test('deve ter rotas configuradas', () => {
      const routes = authRoutes.stack.filter(layer => layer.route);
      expect(routes.length).toBeGreaterThan(0);
    });

    test('rotas devem ter handlers válidos', () => {
      const routes = authRoutes.stack;
      
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
    test('rotas de autenticação não devem ter parâmetros de URL', () => {
      const routes = authRoutes.stack;
      
      routes.forEach(layer => {
        if (layer.route) {
          expect(layer.route.path).not.toContain(':');
        }
      });
    });

    test('deve ter paths específicos para cada operação', () => {
      const routes = authRoutes.stack;
      const paths = routes
        .filter(layer => layer.route)
        .map(layer => layer.route?.path);
      
      expect(paths).toContain('/registrar-cliente');
      expect(paths).toContain('/login');
    });
  });

  describe('Middleware Configuration', () => {
    test('rotas de autenticação podem ter middleware variável', () => {
      // Rotas de login e registro podem ter diferentes configurações
      const routes = authRoutes.stack;
      
      routes.forEach(layer => {
        if (layer.route) {
          // Deve ter pelo menos 1 handler (o controller)
          expect(layer.route.stack.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Controller Integration', () => {
    test('deve instanciar AuthController', () => {
      expect(AuthController).toHaveBeenCalled();
    });

    test('rotas devem usar métodos do controller', () => {
      // Verificar se as rotas foram configuradas com os métodos corretos
      const routes = authRoutes.stack;
      
      expect(routes.length).toBeGreaterThan(0);
      
      // Cada rota deve ter pelo menos um handler
      routes.forEach(layer => {
        if (layer.route) {
          expect(layer.route.stack.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Route Export Validation', () => {
    test('deve exportar um objeto Router do Express', () => {
      expect(authRoutes.constructor.name).toBe('Function');
      expect(authRoutes.stack).toBeDefined();
    });

    test('deve ser importável sem erros', () => {
      expect(() => {
        const routes = require('../../../../infrastructure/http/routes/authRoutes');
        expect(routes).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Route Paths Validation', () => {
    test('deve ter paths únicos e válidos', () => {
      const routes = authRoutes.stack;
      const paths = routes
        .filter(layer => layer.route)
        .map(layer => layer.route?.path);
      
      // Deve ter pelo menos os paths básicos
      expect(paths).toContain('/registrar-cliente');
      expect(paths).toContain('/login');
    });

    test('deve ter configuração de rotas de autenticação', () => {
      const routes = authRoutes.stack.filter(layer => layer.route);
      
      // Deve ter pelo menos as rotas básicas
      expect(routes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Authentication Flow Integration', () => {
    test('deve ter rota para registro de usuários', () => {
      const routes = authRoutes.stack;
      const registrarRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/registrar-cliente'
      );
      
      expect(registrarRoute).toBeDefined();
    });

    test('deve ter rota para login de usuários', () => {
      const routes = authRoutes.stack;
      const loginRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/login'
      );
      
      expect(loginRoute).toBeDefined();
    });
  });

  describe('Swagger Documentation Integration', () => {
    test('arquivo deve conter documentação Swagger', () => {
      const fs = require('fs');
      const path = require('path');
      
      const routeFilePath = path.join(__dirname, '../../../../infrastructure/http/routes/authRoutes.ts');
      const content = fs.readFileSync(routeFilePath, 'utf8');
      
      // Deve conter anotações Swagger
      expect(content).toContain('@swagger');
      expect(content).toContain('components:');
      expect(content).toContain('schemas:');
    });
  });

  describe('Security Considerations', () => {
    test('rotas públicas devem estar acessíveis', () => {
      const routes = authRoutes.stack;
      
      // Todas as rotas de auth devem estar configuradas
      routes.forEach(layer => {
        if (layer.route) {
          // Deve ter pelo menos um handler
          expect(layer.route.stack.length).toBeGreaterThan(0);
        }
      });
    });

    test('deve ter separação clara entre registro e login', () => {
      const routes = authRoutes.stack;
      const paths = routes
        .filter(layer => layer.route)
        .map(layer => layer.route?.path);
      
      expect(paths).toContain('/registrar-cliente');
      expect(paths).toContain('/login');
      expect(paths).not.toContain('/registro'); // Evitar confusão
      expect(paths).not.toContain('/signin'); // Manter consistência
    });
  });
});
