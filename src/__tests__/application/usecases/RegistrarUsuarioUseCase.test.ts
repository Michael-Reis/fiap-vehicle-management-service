import { RegistrarUsuarioUseCase, RegistrarUsuarioInput } from '../../../application/usecases/RegistrarUsuarioUseCase';
import { UsuarioRepository } from '../../../domain/repositories/UsuarioRepository';
import { Usuario, TipoUsuario } from '../../../domain/entities/Usuario';
import bcrypt from 'bcryptjs';

// Mock do bcryptjs
jest.mock('bcryptjs');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('RegistrarUsuarioUseCase', () => {
  let useCase: RegistrarUsuarioUseCase;
  let mockUsuarioRepository: jest.Mocked<UsuarioRepository>;

  beforeEach(() => {
    // Mock do repositório
    mockUsuarioRepository = {
      existePorEmail: jest.fn(),
      existePorCpf: jest.fn(),
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorEmail: jest.fn(),
      buscarPorCpf: jest.fn(),
      buscarTodos: jest.fn(),
      buscarPorTipo: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
    };

    useCase = new RegistrarUsuarioUseCase(mockUsuarioRepository);

    // Mock do bcrypt
    bcryptMock.hash.mockResolvedValue('senha_hash_mockada' as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const inputValido: RegistrarUsuarioInput = {
      nome: 'João Silva',
      email: 'joao@teste.com',
      senha: 'minhasenha123',
      tipo: TipoUsuario.CLIENTE,
      cpf: '11144477735', // CPF válido
      telefone: '11999999999',
      endereco: 'Rua A, 123'
    };

    it('deve registrar um usuário cliente com sucesso', async () => {
      // Arrange
      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      mockUsuarioRepository.existePorCpf.mockResolvedValue(false);
      
      const usuarioMock = new Usuario({
        id: '1',
        nome: inputValido.nome,
        email: inputValido.email,
        senha: 'senha_hash_mockada',
        tipo: inputValido.tipo,
        ativo: true,
        cpf: inputValido.cpf,
        telefone: inputValido.telefone,
        endereco: inputValido.endereco
      });

      mockUsuarioRepository.salvar.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await useCase.execute(inputValido);

      // Assert
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputValido.email);
      expect(mockUsuarioRepository.existePorCpf).toHaveBeenCalledWith(inputValido.cpf);
      expect(bcryptMock.hash).toHaveBeenCalledWith(inputValido.senha, 10);
      expect(mockUsuarioRepository.salvar).toHaveBeenCalled();
      expect(resultado.message).toBe('Usuário registrado com sucesso');
      expect(resultado.usuario).toBeDefined();
      expect(resultado.usuario.nome).toBe(inputValido.nome);
      expect(resultado.usuario.email).toBe(inputValido.email);
    });

    it('deve registrar um usuário admin com sucesso', async () => {
      // Arrange
      const inputAdmin: RegistrarUsuarioInput = {
        nome: 'Admin User',
        email: 'admin@teste.com',
        senha: 'adminpass123',
        tipo: TipoUsuario.ADMIN
      };

      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      
      const usuarioMock = new Usuario({
        id: '2',
        nome: inputAdmin.nome,
        email: inputAdmin.email,
        senha: 'senha_hash_mockada',
        tipo: inputAdmin.tipo,
        ativo: true
      });

      mockUsuarioRepository.salvar.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await useCase.execute(inputAdmin);

      // Assert
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputAdmin.email);
      expect(mockUsuarioRepository.existePorCpf).not.toHaveBeenCalled(); // Não deve verificar CPF para admin
      expect(bcryptMock.hash).toHaveBeenCalledWith(inputAdmin.senha, 10);
      expect(mockUsuarioRepository.salvar).toHaveBeenCalled();
      expect(resultado.message).toBe('Usuário registrado com sucesso');
      expect(resultado.usuario).toBeDefined();
    });

    it('deve falhar quando email já existe', async () => {
      // Arrange
      mockUsuarioRepository.existePorEmail.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(inputValido)).rejects.toThrow('Email já está em uso');
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputValido.email);
      expect(mockUsuarioRepository.existePorCpf).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve falhar quando CPF já existe para cliente', async () => {
      // Arrange
      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      mockUsuarioRepository.existePorCpf.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(inputValido)).rejects.toThrow('CPF já está cadastrado');
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputValido.email);
      expect(mockUsuarioRepository.existePorCpf).toHaveBeenCalledWith(inputValido.cpf);
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve falhar quando cliente não fornece CPF', async () => {
      // Arrange
      const inputSemCpf: RegistrarUsuarioInput = {
        nome: 'João Silva',
        email: 'joao2@teste.com',
        senha: 'minhasenha123',
        tipo: TipoUsuario.CLIENTE,
        telefone: '11999999999',
        endereco: 'Rua A, 123'
      };

      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(inputSemCpf)).rejects.toThrow('CPF é obrigatório e deve ser válido para clientes');
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputSemCpf.email);
    });

    it('deve falhar quando CPF do cliente é inválido', async () => {
      // Arrange
      const inputCpfInvalido: RegistrarUsuarioInput = {
        nome: 'João Silva',
        email: 'joao3@teste.com',
        senha: 'minhasenha123',
        tipo: TipoUsuario.CLIENTE,
        cpf: '12345678901', // CPF inválido
        telefone: '11999999999',
        endereco: 'Rua A, 123'
      };

      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      mockUsuarioRepository.existePorCpf.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(inputCpfInvalido)).rejects.toThrow('CPF é obrigatório e deve ser válido para clientes');
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputCpfInvalido.email);
    });

    it('deve falhar quando repositório lança erro ao verificar email', async () => {
      // Arrange
      mockUsuarioRepository.existePorEmail.mockRejectedValue(new Error('Erro de banco de dados'));

      // Act & Assert
      await expect(useCase.execute(inputValido)).rejects.toThrow('Erro de banco de dados');
      expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith(inputValido.email);
    });

    it('deve falhar quando repositório lança erro ao verificar CPF', async () => {
      // Arrange
      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      mockUsuarioRepository.existePorCpf.mockRejectedValue(new Error('Erro ao verificar CPF'));

      // Act & Assert
      await expect(useCase.execute(inputValido)).rejects.toThrow('Erro ao verificar CPF');
      expect(mockUsuarioRepository.existePorCpf).toHaveBeenCalledWith(inputValido.cpf);
    });

    it('deve falhar quando bcrypt lança erro ao criptografar senha', async () => {
      // Arrange
      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      mockUsuarioRepository.existePorCpf.mockResolvedValue(false);
      bcryptMock.hash.mockRejectedValue(new Error('Erro na criptografia') as never);

      // Act & Assert
      await expect(useCase.execute(inputValido)).rejects.toThrow('Erro na criptografia');
      expect(bcryptMock.hash).toHaveBeenCalledWith(inputValido.senha, 10);
    });

    it('deve falhar quando repositório lança erro ao salvar usuário', async () => {
      // Arrange
      const inputAdmin: RegistrarUsuarioInput = {
        nome: 'Admin Test',
        email: 'admin2@teste.com',
        senha: 'senha123',
        tipo: TipoUsuario.ADMIN
      };

      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      mockUsuarioRepository.salvar.mockRejectedValue(new Error('Erro ao salvar usuário'));

      // Act & Assert
      await expect(useCase.execute(inputAdmin)).rejects.toThrow('Erro ao salvar usuário');
      expect(mockUsuarioRepository.salvar).toHaveBeenCalled();
    });

    it('deve registrar admin com dados mínimos obrigatórios', async () => {
      // Arrange
      const inputMinimo: RegistrarUsuarioInput = {
        nome: 'Admin Minimo',
        email: 'minimo@teste.com',
        senha: 'senha123',
        tipo: TipoUsuario.ADMIN
      };

      mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
      
      const usuarioMock = new Usuario({
        id: '4',
        nome: inputMinimo.nome,
        email: inputMinimo.email,
        senha: 'senha_hash_mockada',
        tipo: inputMinimo.tipo,
        ativo: true
      });

      mockUsuarioRepository.salvar.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await useCase.execute(inputMinimo);

      // Assert
      expect(resultado.message).toBe('Usuário registrado com sucesso');
      expect(resultado.usuario.nome).toBe(inputMinimo.nome);
      expect(resultado.usuario.email).toBe(inputMinimo.email);
      expect(resultado.usuario.tipo).toBe(inputMinimo.tipo);
      expect(resultado.usuario.ativo).toBe(true);
    });

    it('deve validar senha curta', async () => {
      // Arrange
      const inputSenhaCurta: RegistrarUsuarioInput = {
        nome: 'Admin Test',
        email: 'admin3@teste.com',
        senha: '123', // Senha muito curta
        tipo: TipoUsuario.ADMIN
      };

      // Act & Assert
      await expect(useCase.execute(inputSenhaCurta)).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
      expect(mockUsuarioRepository.existePorEmail).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve validar email inválido', async () => {
      // Arrange
      const inputEmailInvalido: RegistrarUsuarioInput = {
        nome: 'Admin Test',
        email: 'email-invalido', // Email inválido
        senha: 'senha123',
        tipo: TipoUsuario.ADMIN
      };

      // Act & Assert
      await expect(useCase.execute(inputEmailInvalido)).rejects.toThrow('Email inválido');
      expect(mockUsuarioRepository.existePorEmail).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve validar nome muito curto', async () => {
      // Arrange
      const inputNomeCurto: RegistrarUsuarioInput = {
        nome: 'A', // Nome muito curto
        email: 'admin4@teste.com',
        senha: 'senha123',
        tipo: TipoUsuario.ADMIN
      };

      // Act & Assert
      await expect(useCase.execute(inputNomeCurto)).rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
      expect(mockUsuarioRepository.existePorEmail).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve validar nome vazio', async () => {
      // Arrange
      const inputNomeVazio: RegistrarUsuarioInput = {
        nome: '', // Nome vazio
        email: 'admin5@teste.com',
        senha: 'senha123',
        tipo: TipoUsuario.ADMIN
      };

      // Act & Assert
      await expect(useCase.execute(inputNomeVazio)).rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
      expect(mockUsuarioRepository.existePorEmail).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });

    it('deve validar nome só com espaços', async () => {
      // Arrange
      const inputNomeEspacos: RegistrarUsuarioInput = {
        nome: '   ', // Nome só com espaços
        email: 'admin6@teste.com',
        senha: 'senha123',
        tipo: TipoUsuario.ADMIN
      };

      // Act & Assert
      await expect(useCase.execute(inputNomeEspacos)).rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
      expect(mockUsuarioRepository.existePorEmail).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
    });
  });
});
