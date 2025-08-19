import request from 'supertest';
import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../../../infrastructure/http/middlewares/authMiddleware';
import * as jwt from 'jsonwebtoken';

// Mock do jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Rota protegida para teste
    app.get('/protected', authMiddleware, (req: AuthenticatedRequest, res) => {
      res.json({ 
        success: true, 
        user: req.user,
        message: 'Acesso autorizado' 
      });
    });

    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  describe('Token válido', () => {
    it('deve permitir acesso com token válido', async () => {
      const mockPayload = {
        userId: 'user_123',
        email: 'user@email.com',
        tipo: 'ADMIN',
        iat: Date.now(),
        exp: Date.now() + 3600000
      };

      mockedJwt.verify.mockReturnValue(mockPayload as any);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: {
          userId: 'user_123',
          email: 'user@email.com',
          tipo: 'ADMIN'
        },
        message: 'Acesso autorizado'
      });

      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    });

    it('deve aceitar token no header authorization em minúsculas', async () => {
      const mockPayload = {
        userId: 'user_123',
        email: 'user@email.com',
        tipo: 'ADMIN'
      };

      mockedJwt.verify.mockReturnValue(mockPayload as any);

      const response = await request(app)
        .get('/protected')
        .set('authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    });
  });

  describe('Falhas de autenticação', () => {
    it('deve retornar 401 quando token não fornecido', async () => {
      const response = await request(app).get('/protected');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    });

    it('deve retornar 401 quando header authorization está vazio', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', '');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    });

    it('deve retornar 401 quando formato do token é inválido', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Formato de token inválido'
      });
    });

    it('deve retornar 401 quando token não tem Bearer prefix', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'just-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Formato de token inválido'
      });
    });

    it('deve retornar 401 quando token é inválido', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Token inválido');
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Token inválido'
      });
    });

    it('deve retornar 401 quando token expirou', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expirado', new Date());
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer expired-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'Token expirado'
      });
    });

    it('deve retornar 500 para outros erros de JWT', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Erro desconhecido');
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer problematic-token');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno de autenticação'
      });
    });
  });

  describe('Configuração de ambiente', () => {
    it('deve usar secret padrão quando JWT_SECRET não está definido', async () => {
      delete process.env.JWT_SECRET;
      
      const mockPayload = {
        userId: 'user_123',
        email: 'user@email.com',
        tipo: 'ADMIN'
      };

      mockedJwt.verify.mockReturnValue(mockPayload as any);

      await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token');

      expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'secret_default');
    });
  });

  describe('Extração de token', () => {
    it('deve extrair corretamente token com espaços extras', async () => {
      const mockPayload = {
        userId: 'user_123',
        email: 'user@email.com',
        tipo: 'ADMIN'
      };

      mockedJwt.verify.mockReturnValue(mockPayload as any);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', '  Bearer   token-with-spaces  ');

      expect(response.status).toBe(200);
      expect(mockedJwt.verify).toHaveBeenCalledWith('token-with-spaces', 'test-secret');
    });
  });
});
