import { UsuarioRepositoryImpl } from '../../../infrastructure/repositories/UsuarioRepositoryImpl';
import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';
import { Usuario, TipoUsuario } from '../../../domain/entities/Usuario';

jest.mock('../../../infrastructure/database/DatabaseConnection');

describe('UsuarioRepositoryImpl - Coverage Tests', () => {
  let usuarioRepository: UsuarioRepositoryImpl;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    mockDb = {
      execute: jest.fn(),
      query: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      getConnection: jest.fn(),
      getInstance: jest.fn()
    } as any;

    // Mock do getInstance
    (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockDb);
    
    usuarioRepository = new UsuarioRepositoryImpl();
    // Injetar o mock via propriedade privada
    (usuarioRepository as any).db = mockDb;
  });

  describe('buscarTodos', () => {
    test('deve buscar todos os usuários com sucesso', async () => {
      const mockRows = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@example.com',
          senha: 'senha123',
          tipo: 'CLIENTE',
          ativo: 1,
          cpf: '11144477735',
          telefone: '11999999999',
          endereco: 'Rua A, 123',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          nome: 'Admin User',
          email: 'admin@example.com',
          senha: 'admin123',
          tipo: 'ADMIN',
          ativo: 1,
          cpf: null,
          telefone: null,
          endereco: null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockDb.query.mockResolvedValue(mockRows);

      const resultado = await usuarioRepository.buscarTodos();

      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM usuarios ORDER BY nome ASC');
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toBeInstanceOf(Usuario);
      expect(resultado[0].email).toBe('joao@example.com');
      expect(resultado[1]).toBeInstanceOf(Usuario);
      expect(resultado[1].email).toBe('admin@example.com');
      expect(resultado[1].tipo).toBe(TipoUsuario.ADMIN);
    });

    test('deve retornar lista vazia quando não há usuários', async () => {
      mockDb.query.mockResolvedValue([]);

      const resultado = await usuarioRepository.buscarTodos();

      expect(resultado).toHaveLength(0);
    });

    test('deve propagar erro do banco de dados', async () => {
      mockDb.query.mockRejectedValue(new Error('Erro de conexão'));

      await expect(usuarioRepository.buscarTodos()).rejects.toThrow('Erro de conexão');
    });
  });

  describe('deletar', () => {
    test('deve deletar usuário com sucesso', async () => {
      mockDb.execute.mockResolvedValue({ affectedRows: 1 } as any);

      await usuarioRepository.deletar('user123');

      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM usuarios WHERE id = ?',
        ['user123']
      );
    });

    test('deve deletar usuário mesmo quando não existe (sem validação)', async () => {
      mockDb.execute.mockResolvedValue({ affectedRows: 0 } as any);

      // O método deletar não valida se o usuário existe, então não deve dar erro
      await usuarioRepository.deletar('user_inexistente');

      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM usuarios WHERE id = ?',
        ['user_inexistente']
      );
    });

    test('deve propagar erro do banco de dados', async () => {
      mockDb.execute.mockRejectedValue(new Error('Erro de conexão'));

      await expect(usuarioRepository.deletar('user123')).rejects.toThrow('Erro de conexão');
    });
  });

  describe('buscarPorId - edge cases', () => {
    test('deve retornar null quando usuário não existe', async () => {
      mockDb.query.mockResolvedValue([]);

      const resultado = await usuarioRepository.buscarPorId('user_inexistente');

      expect(resultado).toBeNull();
    });

    test('deve tratar usuário ADMIN sem CPF', async () => {
      const mockRow = {
        id: '1',
        nome: 'Admin User',
        email: 'admin@example.com',
        senha: 'admin123',
        tipo: 'ADMIN',
        ativo: 1,
        cpf: null,
        telefone: null,
        endereco: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockRow]);

      const resultado = await usuarioRepository.buscarPorId('1');

      expect(resultado).toBeInstanceOf(Usuario);
      expect(resultado?.tipo).toBe(TipoUsuario.ADMIN);
      expect(resultado?.cpf).toBeNull();
    });
  });

  describe('buscarPorEmail - edge cases', () => {
    test('deve retornar null quando email não existe', async () => {
      mockDb.query.mockResolvedValue([]);

      const resultado = await usuarioRepository.buscarPorEmail('inexistente@example.com');

      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorCpf - edge cases', () => {
    test('deve retornar null quando CPF não existe', async () => {
      mockDb.query.mockResolvedValue([]);

      const resultado = await usuarioRepository.buscarPorCpf('00000000000');

      expect(resultado).toBeNull();
    });
  });

  describe('atualizar - campos específicos', () => {
    test('deve atualizar apenas nome', async () => {
      const mockUsuarioAtual = {
        id: '1',
        nome: 'Nome Antigo',
        email: 'test@example.com',
        senha: 'senha123',
        tipo: 'CLIENTE',
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Endereço Antigo',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockUsuarioAtual]);
      mockDb.execute.mockResolvedValue(undefined);

      await usuarioRepository.atualizar('1', { nome: 'Nome Novo' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET nome = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['Nome Novo', expect.any(Date), '1'])
      );
    });

    test('deve atualizar apenas email', async () => {
      const mockUsuarioAtual = {
        id: '1',
        nome: 'João Silva',
        email: 'antigo@example.com',
        senha: 'senha123',
        tipo: 'CLIENTE',
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Endereço',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockUsuarioAtual]);
      mockDb.execute.mockResolvedValue(undefined);

      await usuarioRepository.atualizar('1', { email: 'novo@example.com' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET email = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['novo@example.com', expect.any(Date), '1'])
      );
    });

    test('deve atualizar apenas senha', async () => {
      const mockUsuarioAtual = {
        id: '1',
        nome: 'João Silva',
        email: 'test@example.com',
        senha: 'senhaAntiga',
        tipo: 'CLIENTE',
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Endereço',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockUsuarioAtual]);
      mockDb.execute.mockResolvedValue(undefined);

      await usuarioRepository.atualizar('1', { senha: 'novaSenha' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET senha = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['novaSenha', expect.any(Date), '1'])
      );
    });

    test('deve atualizar telefone e endereco', async () => {
      const mockUsuarioAtual = {
        id: '1',
        nome: 'João Silva',
        email: 'test@example.com',
        senha: 'senha123',
        tipo: 'CLIENTE',
        ativo: 1,
        cpf: '11144477735',
        telefone: '11888888888',
        endereco: 'Endereço Antigo',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockUsuarioAtual]);
      mockDb.execute.mockResolvedValue(undefined);

      await usuarioRepository.atualizar('1', { 
        telefone: '11999999999',
        endereco: 'Novo Endereço, 456'
      });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET telefone = ?, endereco = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['11999999999', 'Novo Endereço, 456', expect.any(Date), '1'])
      );
    });

    test('deve atualizar status ativo', async () => {
      const mockUsuarioAtual = {
        id: '1',
        nome: 'João Silva',
        email: 'test@example.com',
        senha: 'senha123',
        tipo: 'CLIENTE',
        ativo: 1,
        cpf: '11144477735',
        telefone: '11999999999',
        endereco: 'Endereço',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockDb.query.mockResolvedValue([mockUsuarioAtual]);
      mockDb.execute.mockResolvedValue(undefined);

      await usuarioRepository.atualizar('1', { ativo: false });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE usuarios SET ativo = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining([false, expect.any(Date), '1'])
      );
    });
  });
});
