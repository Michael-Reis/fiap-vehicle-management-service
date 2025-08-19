import { UsuarioRepositoryImpl } from '../../../infrastructure/repositories/UsuarioRepositoryImpl';
import { Usuario, TipoUsuario } from '../../../domain/entities/Usuario';
import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';

describe('UsuarioRepositoryImpl - Testes de Integração Simples', () => {
  let usuarioRepository: UsuarioRepositoryImpl;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    mockDb = {
      execute: jest.fn(),
      query: jest.fn(),
      getConnection: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      getInstance: jest.fn()
    } as any;

    usuarioRepository = new UsuarioRepositoryImpl();
    // Injetar o mock via propriedade privada
    (usuarioRepository as any).db = mockDb;
  });

  describe('salvar', () => {
    test('deve salvar usuario com sucesso', async () => {
      const usuario = new Usuario({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
        tipo: TipoUsuario.CLIENTE,
        cpf: '11144477735',
        ativo: true,
        telefone: '11999999999',
        endereco: 'Rua A, 123'
      });

      mockDb.execute.mockResolvedValue({ insertId: 1 });

      const resultado = await usuarioRepository.salvar(usuario);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        expect.arrayContaining([
          usuario.nome,
          usuario.email,
          usuario.senha,
          usuario.tipo,
          usuario.cpf,
          usuario.telefone,
          usuario.endereco
        ])
      );
      expect(resultado).toBeInstanceOf(Usuario);
      expect(resultado.id).toBeDefined();
      expect(resultado.nome).toBe('João Silva');
    });

    test('deve tratar erro na inserção', async () => {
      const usuario = new Usuario({
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
        tipo: TipoUsuario.CLIENTE,
        ativo: true,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Rua A, 123'
      });

      mockDb.execute.mockRejectedValue(new Error('Erro de inserção'));

      await expect(usuarioRepository.salvar(usuario)).rejects.toThrow('Erro de inserção');
    });
  });

  describe('buscarPorId', () => {
    test('deve buscar usuario por ID com sucesso', async () => {
      const mockRow = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
        tipo: TipoUsuario.CLIENTE,
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockRow]);

      const resultado = await usuarioRepository.buscarPorId('1');

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE id = ?',
        ['1']
      );
      expect(resultado).toBeInstanceOf(Usuario);
      expect(resultado!.nome).toBe('João Silva');
    });

    test('deve retornar null quando usuario não encontrado', async () => {
      mockDb.query.mockResolvedValue([]);

      const resultado = await usuarioRepository.buscarPorId('999');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorEmail', () => {
    test('deve buscar usuario por email com sucesso', async () => {
      const mockRow = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
        tipo: TipoUsuario.CLIENTE,
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockRow]);

      const resultado = await usuarioRepository.buscarPorEmail('joao@example.com');

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE email = ?',
        ['joao@example.com']
      );
      expect(resultado).toBeInstanceOf(Usuario);
    });

    test('deve retornar null quando email não encontrado', async () => {
      mockDb.query.mockResolvedValue([]);

      const resultado = await usuarioRepository.buscarPorEmail('inexistente@example.com');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorCpf', () => {
    test('deve buscar usuario por CPF com sucesso', async () => {
      const mockRow = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'senha123',
        tipo: TipoUsuario.CLIENTE,
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockRow]);

      const resultado = await usuarioRepository.buscarPorCpf('11144477735');

      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM usuarios WHERE cpf = ?',
        ['11144477735']
      );
      expect(resultado).toBeInstanceOf(Usuario);
    });
  });

  describe('atualizar', () => {
    test('deve atualizar usuario com sucesso', async () => {
      const mockRow = {
        id: '1',
        nome: 'João Silva Atualizado',
        email: 'joao@example.com',
        senha: 'senha123',
        tipo: TipoUsuario.CLIENTE,
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.execute.mockResolvedValue(undefined);
      mockDb.query.mockResolvedValue([mockRow]);

      const resultado = await usuarioRepository.atualizar('1', { nome: 'João Silva Atualizado' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET'),
        expect.arrayContaining(['João Silva Atualizado', '1'])
      );
      expect(resultado.nome).toBe('João Silva Atualizado');
    });
  });

  describe('deletar', () => {
    test('deve deletar usuario com sucesso', async () => {
      mockDb.execute.mockResolvedValue(undefined);

      await usuarioRepository.deletar('1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM usuarios WHERE id = ?',
        ['1']
      );
    });
  });
});
