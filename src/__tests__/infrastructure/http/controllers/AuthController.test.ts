import { Response } from 'express';
import { AuthController } from '../../../../infrastructure/http/controllers/AuthController';
import { RegistrarUsuarioUseCase } from '../../../../application/usecases/RegistrarUsuarioUseCase';
import { LoginUseCase } from '../../../../application/usecases/LoginUseCase';
import { TipoUsuario } from '../../../../domain/entities/Usuario';
import { AuthenticatedRequest } from '../../../../infrastructure/http/middlewares/authMiddleware';

jest.mock('../../../../application/usecases/RegistrarUsuarioUseCase');
jest.mock('../../../../application/usecases/LoginUseCase');
jest.mock('../../../../infrastructure/repositories/UsuarioRepositoryImpl');

describe('AuthController', () => {
  let authController: AuthController;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockRegistrarUseCase: jest.Mocked<RegistrarUsuarioUseCase>;
  let mockLoginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };

    mockRequest = {
      body: {},
      user: undefined
    };

    authController = new AuthController();
    
    // Mock dos use cases
    mockRegistrarUseCase = (authController as any).registrarUsuarioUseCase;
    mockLoginUseCase = (authController as any).loginUseCase;
  });

  describe('registrar', () => {
    const dadosRegistroValidos = {
      nome: 'João Silva',
      email: 'joao@teste.com',
      senha: '123456',
      tipo: TipoUsuario.CLIENTE,
      cpf: '12345678900',
      telefone: '11999999999'
    };

    it('deve registrar usuário com sucesso', async () => {
      const usuarioRegistrado = {
        id: 'user_123',
        nome: 'João Silva',
        email: 'joao@teste.com',
        tipo: TipoUsuario.CLIENTE,
        cpf: '12345678900',
        telefone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = dadosRegistroValidos;
      mockRegistrarUseCase.execute = jest.fn().mockResolvedValue(usuarioRegistrado);

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockRegistrarUseCase.execute).toHaveBeenCalledWith(dadosRegistroValidos);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(usuarioRegistrado);
    });

    it('deve retornar erro 400 para dados obrigatórios faltando', async () => {
      mockRequest.body = {
        nome: 'João Silva'
        // email, senha e tipo faltando
      };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados obrigatórios faltando',
        details: 'Nome, email, senha e tipo são obrigatórios'
      });
      expect(mockRegistrarUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve tratar erro de email inválido do use case', async () => {
      mockRequest.body = {
        ...dadosRegistroValidos,
        email: 'email-invalido'
      };

      mockRegistrarUseCase.execute = jest.fn().mockRejectedValue(new Error('Email inválido'));

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email inválido'
      });
    });

    it('deve tratar erro de tipo de usuário inválido do use case', async () => {
      mockRequest.body = {
        ...dadosRegistroValidos,
        tipo: 'TIPO_INVALIDO'
      };

      mockRegistrarUseCase.execute = jest.fn().mockRejectedValue(new Error('Tipo de usuário inválido'));

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Tipo de usuário inválido'
      });
    });

    it('deve tratar erro do use case', async () => {
      mockRequest.body = dadosRegistroValidos;
      mockRegistrarUseCase.execute = jest.fn().mockRejectedValue(new Error('Email já cadastrado'));

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email já cadastrado'
      });
    });
  });

  describe('login', () => {
    const dadosLoginValidos = {
      email: 'joao@teste.com',
      senha: '123456'
    };

    it('deve fazer login com sucesso', async () => {
      const resultadoLogin = {
        success: true,
        token: 'jwt-token-123',
        usuario: {
          id: 'user_123',
          nome: 'João Silva',
          email: 'joao@teste.com',
          tipo: TipoUsuario.CLIENTE
        }
      };

      mockRequest.body = dadosLoginValidos;
      mockLoginUseCase.execute = jest.fn().mockResolvedValue(resultadoLogin);

      await authController.login(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(dadosLoginValidos);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(resultadoLogin);
    });

    it('deve retornar erro 400 para dados obrigatórios faltando', async () => {
      mockRequest.body = {
        email: 'joao@teste.com'
        // senha faltando
      };

      await authController.login(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email e senha são obrigatórios'
      });
      expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve tratar erro de login', async () => {
      mockRequest.body = dadosLoginValidos;
      mockLoginUseCase.execute = jest.fn().mockRejectedValue(new Error('Credenciais inválidas'));

      await authController.login(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas'
      });
    });
  });
});
