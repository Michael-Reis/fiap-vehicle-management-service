import { Response } from 'express';
import { AuthController } from '../../../../infrastructure/http/controllers/AuthController';
import { RegistrarUsuarioUseCase } from '../../../../application/usecases/RegistrarUsuarioUseCase';
import { LoginUseCase } from '../../../../application/usecases/LoginUseCase';
import { TipoUsuario } from '../../../../domain/entities/Usuario';
import { AuthenticatedRequest } from '../../../../infrastructure/http/middlewares/authMiddleware';

jest.mock('../../../../application/usecases/RegistrarUsuarioUseCase');
jest.mock('../../../../application/usecases/LoginUseCase');
jest.mock('../../../../infrastructure/repositories/UsuarioRepositoryImpl');

describe('AuthController - Coverage', () => {
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

  describe('registrar - branches de validação', () => {
    it('deve falhar quando dados obrigatórios estão faltando - nome', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.CLIENTE
      };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados obrigatórios faltando',
        details: 'Nome, email, senha e tipo são obrigatórios'
      });
    });

    it('deve falhar quando dados obrigatórios estão faltando - email', async () => {
      mockRequest.body = {
        nome: 'João',
        senha: '123456',
        tipo: TipoUsuario.CLIENTE
      };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve falhar quando dados obrigatórios estão faltando - senha', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        tipo: TipoUsuario.CLIENTE
      };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve falhar quando dados obrigatórios estão faltando - tipo', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456'
      };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve falhar quando não-admin tenta criar admin', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.ADMIN
      };
      
      // Usuário não é admin
      mockRequest.user = { userId: '1', email: 'user@test.com', tipo: TipoUsuario.CLIENTE };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Acesso negado. Apenas administradores podem criar outros administradores'
      });
    });

    it('deve falhar quando usuário não autenticado tenta criar admin', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.ADMIN
      };
      
      // Usuário não autenticado
      mockRequest.user = undefined;

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it('deve permitir admin criar outro admin', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'admin@test.com',
        senha: '123456',
        tipo: TipoUsuario.ADMIN
      };
      
      // Usuário é admin
      mockRequest.user = { userId: '1', email: 'admin@test.com', tipo: TipoUsuario.ADMIN };
      
      mockRegistrarUseCase.execute.mockResolvedValueOnce({ id: '1', message: 'Admin criado' } as any);

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('deve falhar quando cliente não tem CPF', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.CLIENTE
        // CPF ausente
      };

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'CPF é obrigatório para clientes'
      });
    });

    it('deve registrar cliente com CPF', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.CLIENTE,
        cpf: '12345678901'
      };

      mockRegistrarUseCase.execute.mockResolvedValueOnce({ id: '1', message: 'Cliente criado' } as any);

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('deve tratar erro no use case', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.CLIENTE,
        cpf: '12345678901'
      };

      const errorMessage = 'Erro no use case';
      mockRegistrarUseCase.execute.mockRejectedValueOnce(new Error(errorMessage));

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });

    it('deve tratar erro sem mensagem', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        tipo: TipoUsuario.CLIENTE,
        cpf: '12345678901'
      };

      mockRegistrarUseCase.execute.mockRejectedValueOnce({});

      await authController.registrar(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro ao registrar usuário'
      });
    });
  });

  describe('registrarCliente - branches de validação', () => {
    it('deve falhar quando nome está faltando', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        senha: '123456',
        cpf: '12345678901'
      };

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados obrigatórios faltando',
        details: 'Nome, email, senha e CPF são obrigatórios para clientes'
      });
    });

    it('deve falhar quando email está faltando', async () => {
      mockRequest.body = {
        nome: 'João',
        senha: '123456',
        cpf: '12345678901'
      };

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve falhar quando senha está faltando', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        cpf: '12345678901'
      };

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve falhar quando CPF está faltando', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456'
      };

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve registrar cliente com sucesso', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        cpf: '12345678901'
      };

      mockRegistrarUseCase.execute.mockResolvedValueOnce({ id: '1', message: 'Cliente criado' } as any);

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('deve tratar erro no registrarCliente', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        cpf: '12345678901'
      };

      const errorMessage = 'Erro no use case';
      mockRegistrarUseCase.execute.mockRejectedValueOnce(new Error(errorMessage));

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });

    it('deve tratar erro sem mensagem no registrarCliente', async () => {
      mockRequest.body = {
        nome: 'João',
        email: 'test@test.com',
        senha: '123456',
        cpf: '12345678901'
      };

      mockRegistrarUseCase.execute.mockRejectedValueOnce({});

      await authController.registrarCliente(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro ao registrar cliente'
      });
    });
  });

  describe('login - branches de validação', () => {
    it('deve falhar quando email está faltando', async () => {
      mockRequest.body = {
        senha: '123456'
      };

      await authController.login(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email e senha são obrigatórios'
      });
    });

    it('deve falhar quando senha está faltando', async () => {
      mockRequest.body = {
        email: 'test@test.com'
      };

      await authController.login(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('deve fazer login com sucesso', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        senha: '123456'
      };

      mockLoginUseCase.execute.mockResolvedValueOnce({ token: 'jwt-token' } as any);

      await authController.login(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('deve tratar erro no login', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        senha: '123456'
      };

      const errorMessage = 'Credenciais inválidas';
      mockLoginUseCase.execute.mockRejectedValueOnce(new Error(errorMessage));

      await authController.login(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: errorMessage
      });
    });

    it('deve tratar erro sem mensagem no login', async () => {
      mockRequest.body = {
        email: 'test@test.com',
        senha: '123456'
      };

      mockLoginUseCase.execute.mockRejectedValueOnce({});

      await authController.login(mockRequest as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro ao fazer login'
      });
    });
  });
});
