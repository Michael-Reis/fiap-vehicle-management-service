import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';
import mysql from 'mysql2/promise';

// Mock do mysql2/promise
jest.mock('mysql2/promise');
const mockMysql = mysql as jest.Mocked<typeof mysql>;

describe('DatabaseConnection', () => {
  let databaseConnection: DatabaseConnection;
  let mockConnection: any;

  beforeEach(() => {
    // Reset do singleton
    (DatabaseConnection as any).instance = undefined;
    
    // Salvar variáveis de ambiente originais
    const originalEnv = { ...process.env };
    
    // Limpar variáveis de teste específicas para ter valores padrão
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.DB_PORT;
    
    // Mock da conexão
    mockConnection = {
      execute: jest.fn(),
      end: jest.fn(),
    };
    
    mockMysql.createConnection = jest.fn().mockResolvedValue(mockConnection);
    
    databaseConnection = DatabaseConnection.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('deve retornar a mesma instância (singleton)', () => {
      const instance1 = DatabaseConnection.getInstance();
      const instance2 = DatabaseConnection.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('connect', () => {
    it('deve conectar com sucesso usando configurações padrão', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await databaseConnection.connect();
      
      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'servico_principal',
        port: 3306,
        charset: 'utf8mb4'
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Conectado ao banco MySQL do serviço principal');
      consoleSpy.mockRestore();
    });

    it('deve conectar usando variáveis de ambiente', async () => {
      process.env.DB_HOST = 'localhost-test';
      process.env.DB_USER = 'testuser';
      process.env.DB_PASSWORD = 'testpass';
      process.env.DB_NAME = 'testdb';
      process.env.DB_PORT = '3307';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await databaseConnection.connect();
      
      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost-test',
        user: 'testuser',
        password: 'testpass',
        database: 'testdb',
        port: 3307,
        charset: 'utf8mb4'
      });
      
      consoleSpy.mockRestore();
      
      // Limpar variáveis de ambiente
      delete process.env.DB_HOST;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;
      delete process.env.DB_PORT;
    });

    it('deve lançar erro quando falha na conexão', async () => {
      const error = new Error('Falha na conexão');
      mockMysql.createConnection.mockRejectedValue(error);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(databaseConnection.connect()).rejects.toThrow('Falha na conexão');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao conectar no MySQL:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    it('deve desconectar quando há conexão ativa', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await databaseConnection.connect();
      await databaseConnection.disconnect();
      
      expect(mockConnection.end).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Desconectado do banco MySQL');
      consoleSpy.mockRestore();
    });

    it('deve não fazer nada quando não há conexão ativa', async () => {
      await databaseConnection.disconnect();
      
      expect(mockConnection.end).not.toHaveBeenCalled();
    });
  });

  describe('getConnection', () => {
    it('deve retornar a conexão quando conectado', async () => {
      await databaseConnection.connect();
      
      const connection = databaseConnection.getConnection();
      
      expect(connection).toBe(mockConnection);
    });

    it('deve lançar erro quando não conectado', () => {
      expect(() => databaseConnection.getConnection()).toThrow('Database não conectado');
    });
  });

  describe('execute', () => {
    it('deve executar query com sucesso', async () => {
      const mockResult = [{ insertId: 1 }];
      mockConnection.execute.mockResolvedValue([mockResult, []]);
      
      await databaseConnection.connect();
      const result = await databaseConnection.execute('INSERT INTO test VALUES (?)', ['value']);
      
      expect(mockConnection.execute).toHaveBeenCalledWith('INSERT INTO test VALUES (?)', ['value']);
      expect(result).toBe(mockResult);
    });

    it('deve executar query sem parâmetros', async () => {
      const mockResult = [{ insertId: 1 }];
      mockConnection.execute.mockResolvedValue([mockResult, []]);
      
      await databaseConnection.connect();
      const result = await databaseConnection.execute('SELECT * FROM test');
      
      expect(mockConnection.execute).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(result).toBe(mockResult);
    });
  });

  describe('query', () => {
    it('deve executar query e retornar rows', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockConnection.execute.mockResolvedValue([mockRows, []]);
      
      await databaseConnection.connect();
      const rows = await databaseConnection.query('SELECT * FROM test WHERE id = ?', [1]);
      
      expect(mockConnection.execute).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', [1]);
      expect(rows).toBe(mockRows);
    });

    it('deve executar query sem parâmetros', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockConnection.execute.mockResolvedValue([mockRows, []]);
      
      await databaseConnection.connect();
      const rows = await databaseConnection.query('SELECT * FROM test');
      
      expect(mockConnection.execute).toHaveBeenCalledWith('SELECT * FROM test', []);
      expect(rows).toBe(mockRows);
    });
  });

  describe('initializeSchema', () => {
    it('deve inicializar o schema do banco de dados', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockConnection.execute.mockResolvedValue([[], []]);
      
      await databaseConnection.connect();
      await databaseConnection.initializeSchema();
      
      expect(mockConnection.execute).toHaveBeenCalledTimes(4);
      
      // Verificar se as queries de criação de tabelas foram chamadas
      const calls = mockConnection.execute.mock.calls;
      expect(calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS usuarios');
      expect(calls[1][0]).toContain('CREATE TABLE IF NOT EXISTS veiculos');
      
      // Verificar se as queries de migração foram chamadas
      expect(calls[2][0]).toContain('ALTER TABLE usuarios MODIFY COLUMN id VARCHAR(50)');
      expect(calls[3][0]).toContain('ALTER TABLE veiculos MODIFY COLUMN id VARCHAR(50)');
      
      expect(consoleSpy).toHaveBeenCalledWith('Schema do banco de dados MySQL inicializado');
      consoleSpy.mockRestore();
    });

    it('deve lançar erro se a criação das tabelas falhar', async () => {
      const error = new Error('Erro na criação da tabela');
      mockConnection.execute.mockRejectedValue(error);
      
      await databaseConnection.connect();
      
      await expect(databaseConnection.initializeSchema()).rejects.toThrow('Erro na criação da tabela');
    });
  });
});