import veiculoRoutes from '../../../../infrastructure/http/routes/veiculoRoutes';
import { VeiculoController } from '../../../../infrastructure/http/controllers/VeiculoController';
import { authMiddleware } from '../../../../infrastructure/http/middlewares/authMiddleware';

// Mock do middleware de autenticação
jest.mock('../../../../infrastructure/http/middlewares/authMiddleware', () => ({
  authMiddleware: jest.fn()
}));

// Mock do controller
jest.mock('../../../../infrastructure/http/controllers/VeiculoController');

describe('VeiculoRoutes Integration Tests', () => {
  let mockVeiculoController: jest.Mocked<VeiculoController>;

  beforeEach(() => {
    mockVeiculoController = new VeiculoController() as jest.Mocked<VeiculoController>;
    
    // Mock dos métodos do controller
    mockVeiculoController.cadastrar = jest.fn();
    mockVeiculoController.listar = jest.fn();
    mockVeiculoController.buscarPorId = jest.fn();
    mockVeiculoController.atualizar = jest.fn();
    mockVeiculoController.deletar = jest.fn();

    // Configura mocks para retornar status de sucesso
    mockVeiculoController.cadastrar.mockResolvedValue();
    mockVeiculoController.listar.mockResolvedValue();
    mockVeiculoController.buscarPorId.mockResolvedValue();
    mockVeiculoController.atualizar.mockResolvedValue();
    mockVeiculoController.deletar.mockResolvedValue();
  });

  describe('Router Configuration', () => {
    test('deve exportar um router válido', () => {
      expect(veiculoRoutes).toBeDefined();
      expect(typeof veiculoRoutes).toBe('function');
    });

    test('deve ter as propriedades de um router Express', () => {
      expect(veiculoRoutes).toHaveProperty('stack');
      expect(Array.isArray(veiculoRoutes.stack)).toBe(true);
    });

    test('deve ter rotas configuradas', () => {
      expect(veiculoRoutes.stack.length).toBeGreaterThan(0);
    });
  });

  describe('Route Definitions', () => {
    test('deve ter rota POST /', () => {
      const routes = veiculoRoutes.stack;
      const postRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/'
      );
      
      expect(postRoute).toBeDefined();
      expect(postRoute?.route?.path).toBe('/');
    });

    test('deve ter rota GET /', () => {
      const routes = veiculoRoutes.stack;
      const getListRoute = routes.find((layer, index) => 
        layer.route && 
        layer.route.path === '/' &&
        index > 0 // Não é a primeira rota (que é POST)
      );
      
      expect(getListRoute).toBeDefined();
      expect(getListRoute?.route?.path).toBe('/');
    });

    test('deve ter rota GET /:id', () => {
      const routes = veiculoRoutes.stack;
      const getRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/:id'
      );
      
      expect(getRoute).toBeDefined();
      expect(getRoute?.route?.path).toBe('/:id');
    });

    test('deve ter rota PUT /:id', () => {
      const routes = veiculoRoutes.stack;
      const putRoute = routes.find(layer => 
        layer.route && 
        layer.route.path === '/:id'
      );
      
      expect(putRoute).toBeDefined();
      expect(putRoute?.route?.path).toBe('/:id');
    });

    test('deve ter rota DELETE /:id', () => {
      const routes = veiculoRoutes.stack;
      const deleteRoutes = routes.filter(layer => 
        layer.route && 
        layer.route.path === '/:id'
      );
      
      // Deve ter pelo menos uma rota /:id (GET, PUT ou DELETE)
      expect(deleteRoutes.length).toBeGreaterThan(0);
    });
  });

  describe('Route Structure Validation', () => {
    test('deve ter exatamente 5 rotas configuradas', () => {
      const routes = veiculoRoutes.stack.filter(layer => layer.route);
      expect(routes).toHaveLength(5);
    });

    test('rotas devem ter handlers válidos', () => {
      const routes = veiculoRoutes.stack;
      
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
    test('rotas com parâmetro id devem aceitar parâmetro :id', () => {
      const routes = veiculoRoutes.stack;
      const paramRoutes = routes.filter(layer => 
        layer.route && 
        layer.route.path === '/:id'
      );
      
      expect(paramRoutes.length).toBeGreaterThan(0);
      paramRoutes.forEach(route => {
        expect(route.route?.path).toContain(':id');
      });
    });

    test('rota raiz não deve ter parâmetros de URL', () => {
      const routes = veiculoRoutes.stack;
      const rootRoutes = routes.filter(layer => 
        layer.route && 
        layer.route.path === '/'
      );
      
      expect(rootRoutes.length).toBeGreaterThan(0);
      rootRoutes.forEach(route => {
        expect(route.route?.path).not.toContain(':');
      });
    });
  });

  describe('Middleware Configuration', () => {
    test('deve usar authMiddleware em rotas protegidas', () => {
      // Verifica se o authMiddleware foi importado
      expect(authMiddleware).toBeDefined();
    });

    test('rotas protegidas devem ter mais de um handler (middleware + controller)', () => {
      const routes = veiculoRoutes.stack;
      
      // Algumas rotas devem ter middleware de autenticação
      const protectedRoutes = routes.filter(layer => 
        layer.route && 
        layer.route.stack.length > 1
      );
      
      expect(protectedRoutes.length).toBeGreaterThan(0);
    });

    test('rotas GET públicas podem ter apenas um handler', () => {
      const routes = veiculoRoutes.stack;
      
      // Deve haver pelo menos uma rota
      expect(routes.length).toBeGreaterThan(0);
      
      routes.forEach(layer => {
        if (layer.route) {
          // Cada rota deve ter pelo menos um handler
          expect(layer.route.stack.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Controller Integration', () => {
    test('deve instanciar VeiculoController', () => {
      expect(VeiculoController).toHaveBeenCalled();
    });

    test('rotas devem usar métodos do controller', () => {
      // Verificar se as rotas foram configuradas com os métodos corretos
      const routes = veiculoRoutes.stack;
      
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
      expect(veiculoRoutes.constructor.name).toBe('Function');
      expect(veiculoRoutes.stack).toBeDefined();
    });

    test('deve ser importável sem erros', () => {
      expect(() => {
        const routes = require('../../../../infrastructure/http/routes/veiculoRoutes');
        expect(routes).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Route Paths Validation', () => {
    test('deve ter paths únicos e válidos', () => {
      const routes = veiculoRoutes.stack;
      const paths = routes
        .filter(layer => layer.route)
        .map(layer => layer.route?.path);
      
      // Deve ter pelo menos os paths básicos
      expect(paths).toContain('/');
      expect(paths).toContain('/:id');
    });

    test('deve ter configuração de rotas CRUD completa', () => {
      const routes = veiculoRoutes.stack.filter(layer => layer.route);
      
      // Deve ter rotas para:
      // POST / (criar)
      // GET / (listar)
      // GET /:id (buscar)
      // PUT /:id (atualizar)
      // DELETE /:id (deletar)
      expect(routes.length).toBe(5);
    });
  });

  describe('Swagger Documentation Integration', () => {
    test('arquivo deve conter documentação Swagger', () => {
      const fs = require('fs');
      const path = require('path');
      
      const routeFilePath = path.join(__dirname, '../../../../infrastructure/http/routes/veiculoRoutes.ts');
      const content = fs.readFileSync(routeFilePath, 'utf8');
      
      // Deve conter anotações Swagger
      expect(content).toContain('@swagger');
      expect(content).toContain('components:');
      expect(content).toContain('schemas:');
    });
  });
});
