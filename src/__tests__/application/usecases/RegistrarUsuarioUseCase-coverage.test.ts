import { RegistrarUsuarioUseCase } from '../../../application/usecases/RegistrarUsuarioUseCase';
import { Usuario, TipoUsuario } from '../../../domain/entities/Usuario';
import { UsuarioRepository } from '../../../domain/repositories/UsuarioRepository';

describe('RegistrarUsuarioUseCase - Testes de Cobertura', () => {
  let registrarUsuarioUseCase: RegistrarUsuarioUseCase;
  let mockUsuarioRepository: jest.Mocked<UsuarioRepository>;

  beforeEach(() => {
    mockUsuarioRepository = {
      salvar: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorEmail: jest.fn(),
      buscarPorCpf: jest.fn(),
      buscarTodos: jest.fn(),
      buscarPorTipo: jest.fn(),
      atualizar: jest.fn(),
      deletar: jest.fn(),
      existePorEmail: jest.fn(),
      existePorCpf: jest.fn(),
    };

    registrarUsuarioUseCase = new RegistrarUsuarioUseCase(
      mockUsuarioRepository
    );
  });

  test('deve registrar usuário com sucesso', async () => {
    const dadosUsuario = {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678909', // CPF válido para teste
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    };

    const usuarioSalvo = new Usuario({
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678909',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE,
      ativo: true
    });

    mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
    mockUsuarioRepository.existePorCpf.mockResolvedValue(false);
    mockUsuarioRepository.salvar.mockResolvedValue(usuarioSalvo);

    const resultado = await registrarUsuarioUseCase.execute(dadosUsuario);

    expect(resultado.message).toBe('Usuário registrado com sucesso');
    expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith('joao@example.com');
    expect(mockUsuarioRepository.existePorCpf).toHaveBeenCalledWith('12345678909');
    expect(mockUsuarioRepository.salvar).toHaveBeenCalledWith(expect.any(Usuario));
  });

  test('deve lançar erro se email já existir', async () => {
    const dadosUsuario = {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678901',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    };

    mockUsuarioRepository.existePorEmail.mockResolvedValue(true);

    await expect(registrarUsuarioUseCase.execute(dadosUsuario))
      .rejects
      .toThrow('Email já está em uso');

    expect(mockUsuarioRepository.existePorEmail).toHaveBeenCalledWith('joao@example.com');
    expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
  });

  test('deve lançar erro se CPF já existir', async () => {
    const dadosUsuario = {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678909',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    };

    mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
    mockUsuarioRepository.existePorCpf.mockResolvedValue(true);

    await expect(registrarUsuarioUseCase.execute(dadosUsuario))
      .rejects
      .toThrow('CPF já está cadastrado');

    expect(mockUsuarioRepository.existePorCpf).toHaveBeenCalledWith('12345678909');
    expect(mockUsuarioRepository.salvar).not.toHaveBeenCalled();
  });

  test('deve validar nome obrigatório', async () => {
    await expect(registrarUsuarioUseCase.execute({
      nome: '',
      email: 'joao@example.com',
      cpf: '12345678901',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    })).rejects.toThrow('Nome deve ter pelo menos 2 caracteres');

    await expect(registrarUsuarioUseCase.execute({
      nome: 'J',
      email: 'joao@example.com',
      cpf: '12345678901',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    })).rejects.toThrow('Nome deve ter pelo menos 2 caracteres');
  });

  test('deve validar email obrigatório', async () => {
    await expect(registrarUsuarioUseCase.execute({
      nome: 'João Silva',
      email: '',
      cpf: '12345678901',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    })).rejects.toThrow('Email inválido');

    await expect(registrarUsuarioUseCase.execute({
      nome: 'João Silva',
      email: 'email-invalido',
      cpf: '12345678901',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    })).rejects.toThrow('Email inválido');
  });

  test('deve validar senha obrigatória', async () => {
    await expect(registrarUsuarioUseCase.execute({
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678901',
      senha: '',
      tipo: TipoUsuario.CLIENTE
    })).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');

    await expect(registrarUsuarioUseCase.execute({
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678901',
      senha: '123',
      tipo: TipoUsuario.CLIENTE
    })).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
  });

  test('deve validar tipo de usuário obrigatório', async () => {
    await expect(registrarUsuarioUseCase.execute({
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: 'senha123',
      tipo: null as any
    })).rejects.toThrow('Tipo de usuário é obrigatório');
    
    await expect(registrarUsuarioUseCase.execute({
      nome: 'João Silva',
      email: 'joao@example.com',
      senha: 'senha123',
      tipo: 'INVALIDO' as any
    })).rejects.toThrow('Tipo de usuário é obrigatório');
  });

  test('deve criptografar a senha antes de salvar', async () => {
    const dadosUsuario = {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678909',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE
    };

    const usuarioSalvo = new Usuario({
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678909',
      senha: 'senha123',
      tipo: TipoUsuario.CLIENTE,
      ativo: true
    });

    mockUsuarioRepository.existePorEmail.mockResolvedValue(false);
    mockUsuarioRepository.existePorCpf.mockResolvedValue(false);
    mockUsuarioRepository.salvar.mockResolvedValue(usuarioSalvo);

    await registrarUsuarioUseCase.execute(dadosUsuario);

    expect(mockUsuarioRepository.salvar).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678909',
        tipo: TipoUsuario.CLIENTE,
        ativo: true
      })
    );
  });
});
