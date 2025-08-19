import { LoginUseCase } from '../../../application/usecases/LoginUseCase';

// Mock direto da implementação existente sem problemas de tipagem
jest.mock('../../../infrastructure/repositories/UsuarioRepositoryImpl', () => {
  return {
    UsuarioRepositoryImpl: jest.fn().mockImplementation(() => {
      return {
        buscarPorEmail: jest.fn()
      };
    })
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

import { UsuarioRepositoryImpl } from '../../../infrastructure/repositories/UsuarioRepositoryImpl';
import { Usuario, TipoUsuario } from '../../../domain/entities/Usuario';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockRepository: jest.Mocked<UsuarioRepositoryImpl>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new UsuarioRepositoryImpl() as jest.Mocked<UsuarioRepositoryImpl>;
    loginUseCase = new LoginUseCase();
    (loginUseCase as any).usuarioRepository = mockRepository;
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('execute', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = new Usuario({
        id: 'user_123',
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678909',
        telefone: '11999999999',
        senha: 'hashedPassword',
        tipo: TipoUsuario.CLIENTE,
        ativo: true
      });

      mockRepository.buscarPorEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await loginUseCase.execute({
        email: 'joao@email.com',
        senha: 'password123'
      });

      expect(result.message).toBe('Login realizado com sucesso');
      expect(result.token).toBe('mock_token');
      expect(result.usuario).toBeDefined();
      expect(result.usuario.email).toBe('joao@email.com');
    });

    it('deve lançar erro para usuário não encontrado', async () => {
      mockRepository.buscarPorEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute({
        email: 'inexistente@email.com',
        senha: 'password123'
      })).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro para usuário inativo', async () => {
      const mockUser = new Usuario({
        id: 'user_123',
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678909',
        telefone: '11999999999',
        senha: 'hashedPassword',
        tipo: TipoUsuario.CLIENTE,
        ativo: false // usuário inativo
      });

      mockRepository.buscarPorEmail.mockResolvedValue(mockUser);

      await expect(loginUseCase.execute({
        email: 'joao@email.com',
        senha: 'password123'
      })).rejects.toThrow('Usuário inativo');
    });

    it('deve lançar erro para senha incorreta', async () => {
      const mockUser = new Usuario({
        id: 'user_123',
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678909',
        telefone: '11999999999',
        senha: 'hashedPassword',
        tipo: TipoUsuario.CLIENTE,
        ativo: true
      });

      mockRepository.buscarPorEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUseCase.execute({
        email: 'joao@email.com',
        senha: 'senhaErrada'
      })).rejects.toThrow('Credenciais inválidas');
    });

    it('deve usar JWT_SECRET padrão quando não definido', async () => {
      delete process.env.JWT_SECRET;

      const mockUser = new Usuario({
        id: 'user_123',
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678909',
        telefone: '11999999999',
        senha: 'hashedPassword',
        tipo: TipoUsuario.CLIENTE,
        ativo: true
      });

      mockRepository.buscarPorEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token_with_default');

      await loginUseCase.execute({
        email: 'joao@email.com',
        senha: 'password123'
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'secret_default',
        expect.any(Object)
      );
    });

    it('deve criar payload JWT correto', async () => {
      const mockUser = new Usuario({
        id: 'user_123',
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678909',
        telefone: '11999999999',
        senha: 'hashedPassword',
        tipo: TipoUsuario.ADMIN,
        ativo: true
      });

      mockRepository.buscarPorEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('admin_token');

      await loginUseCase.execute({
        email: 'joao@email.com',
        senha: 'password123'
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 'user_123',
          email: 'joao@email.com',
          tipo: TipoUsuario.ADMIN
        },
        'test_secret',
        { expiresIn: 200000 }
      );
    });
  });
});
