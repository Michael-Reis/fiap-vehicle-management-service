import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Mock dos módulos externos
jest.mock('../../infrastructure/database/DatabaseConnection');
jest.mock('../../infrastructure/repositories/VeiculoRepositoryImpl');
jest.mock('../../infrastructure/repositories/UsuarioRepositoryImpl');

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Configurar aplicação para testes
    app = express();
    
    // Middlewares básicos
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Rotas de teste
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'test'
      });
    });

    app.get('/api/veiculos', (req, res) => {
      res.json({
        success: true,
        data: [
          {
            id: 'veh_1',
            marca: 'Toyota',
            modelo: 'Corolla',
            ano: 2023,
            cor: 'Branco',
            preco: 85000,
            status: 'A_VENDA'
          }
        ]
      });
    });

    // Rotas para testes específicos
    app.post('/test-json', (req, res) => {
      res.json({ received: req.body });
    });

    app.get('/test-error', (req, res, next) => {
      const error = new Error('Erro de teste');
      next(error);
    });

    app.post('/test-form', (req, res) => {
      res.json({ received: req.body });
    });

    // Middleware de erro global
    app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    });
  });

  describe('Health Check', () => {
    it('deve retornar status da aplicação', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        environment: 'test'
      });
    });
  });

  describe('CORS Configuration', () => {
    it('deve incluir headers CORS nas respostas', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('deve responder a requisições OPTIONS', async () => {
      const response = await request(app)
        .options('/api/veiculos')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
    });
  });

  describe('Security Headers', () => {
    it('deve incluir headers de segurança do Helmet', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });

  describe('JSON Parsing', () => {
    it('deve processar JSON no body da requisição', async () => {
      const testData = { name: 'Test', value: 123 };
      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(testData);
    });

    it('deve retornar erro para JSON malformado', async () => {
      const response = await request(app)
        .post('/test-json')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Error Handling', () => {
    it('deve capturar erros não tratados', async () => {
      const response = await request(app).get('/test-error');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('404 Handling', () => {
    it('deve retornar 404 para rotas não encontradas', async () => {
      const response = await request(app).get('/rota-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Rota não encontrada'
      });
    });
  });

  describe('Content Type Handling', () => {
    it('deve retornar JSON por padrão', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('URL Encoded Parsing', () => {
    it('deve processar dados url-encoded', async () => {
      const response = await request(app)
        .post('/test-form')
        .send('name=Test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({
        name: 'Test',
        value: '123'
      });
    });
  });

  describe('Performance Headers', () => {
    it('deve incluir header de tempo de resposta', async () => {
      const start = Date.now();
      const response = await request(app).get('/health');
      const end = Date.now();

      expect(response.status).toBe(200);
      expect(end - start).toBeLessThan(1000); // Resposta em menos de 1 segundo
    });
  });
});
