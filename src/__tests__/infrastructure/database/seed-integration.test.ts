import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';
import { DatabaseSeed } from '../../../infrastructure/database/seed';

describe('DatabaseSeed - Testes de Integração Simples', () => {
  let databaseConnection: DatabaseConnection;
  let databaseSeed: DatabaseSeed;

  beforeAll(() => {
    // Mock do console.error para evitar logs desnecessários
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock do process.exit para evitar que o teste termine o processo
    jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
      throw new Error(`process.exit called with code ${code}`);
    });
  });

  beforeEach(() => {
    databaseConnection = DatabaseConnection.getInstance();
    databaseSeed = new DatabaseSeed();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('executar', () => {
    test('deve tratar erro quando database não está conectado', async () => {
      // Força erro de conexão
      jest.spyOn(databaseConnection, 'getConnection').mockImplementation(() => {
        throw new Error('Database não conectado');
      });
      
      await expect(async () => {
        await databaseSeed.executar();
      }).rejects.toThrow('process.exit called with code 1');
      
      expect(console.error).toHaveBeenCalledWith(
        'Erro durante o seed:', 
        expect.any(Error)
      );
    });

    test('deve executar seed com sucesso quando database está conectado', async () => {
      // Mock da conexão
      jest.spyOn(databaseConnection, 'connect').mockResolvedValue(undefined);
      jest.spyOn(databaseConnection, 'execute').mockResolvedValue(undefined);
      jest.spyOn(databaseConnection, 'query').mockResolvedValue([]); // Simula que não há admin existente
      
      await databaseSeed.executar();
      
      expect(console.log).toHaveBeenCalledWith('Seed executado com sucesso!');
    });

    test('deve lidar com erro na criação de tabelas', async () => {
      // Mock erro na conexão ou query
      jest.spyOn(databaseConnection, 'connect').mockRejectedValue(new Error('Erro de conexão'));
      
      await expect(async () => {
        await databaseSeed.executar();
      }).rejects.toThrow('process.exit called with code 1');
      
      expect(console.error).toHaveBeenCalledWith(
        'Erro durante o seed:', 
        expect.any(Error)
      );
    });
  });

  describe('criarAdminInicial', () => {
    test('deve criar admin quando não existe', async () => {
      jest.spyOn(databaseConnection, 'connect').mockResolvedValue(undefined);
      jest.spyOn(databaseConnection, 'query').mockResolvedValue([]); // Não há admin existente
      
      await databaseSeed.criarAdminInicial();
      
      expect(databaseConnection.query).toHaveBeenCalledWith(
        'SELECT id FROM usuarios WHERE email = ?',
        ['admin@admin.com.br']
      );
      // Verifica se query foi chamada para inserir o admin (não execute)
      expect(databaseConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        expect.any(Array)
      );
    });

    test('deve atualizar senha quando admin já existe', async () => {
      jest.spyOn(databaseConnection, 'connect').mockResolvedValue(undefined);
      jest.spyOn(databaseConnection, 'query')
        .mockResolvedValueOnce([{ id: 1 }]) // Admin já existe (primeira consulta)
        .mockResolvedValueOnce(undefined); // Update bem-sucedido (segunda consulta)
      
      await databaseSeed.criarAdminInicial();
      
      expect(console.log).toHaveBeenCalledWith('Admin inicial já existe - senha atualizada com sucesso!');
      expect(databaseConnection.query).toHaveBeenCalledWith(
        'UPDATE usuarios SET senha = ?, updated_at = NOW() WHERE email = ?',
        expect.any(Array)
      );
    });
  });
});
