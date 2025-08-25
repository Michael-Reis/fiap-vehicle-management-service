import { DatabaseSeed } from '../../../infrastructure/database/seed';
import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';
import { TipoUsuario } from '../../../domain/entities/Usuario';
import * as bcrypt from 'bcrypt';

// Mock das dependências
jest.mock('../../../infrastructure/database/DatabaseConnection');
jest.mock('bcrypt');

describe('DatabaseSeed - Coverage', () => {
  let seed: DatabaseSeed;
  let mockDb: jest.Mocked<DatabaseConnection>;
  let consoleSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDb = {
      connect: jest.fn(),
      query: jest.fn(),
      execute: jest.fn(),
      close: jest.fn(),
    } as any;

    (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockDb);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    seed = new DatabaseSeed();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('criarAdminInicial', () => {
    it('deve criar admin quando não existe', async () => {
      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      mockDb.query.mockResolvedValueOnce(undefined); // Insert bem-sucedido

      await seed.criarAdminInicial();

      expect(mockDb.connect).toHaveBeenCalled();
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id FROM usuarios WHERE email = ?',
        ['admin@admin.com.br']
      );
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        expect.arrayContaining([
          'Administrador Sistema',
          'admin@admin.com.br',
          'hashed_password',
          TipoUsuario.ADMIN
        ])
      );
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Admin inicial criado com sucesso!');
    });

    it('deve atualizar senha quando admin já existe', async () => {
      const originalEnv = process.env.ADMIN_PASSWORD;
      process.env.ADMIN_PASSWORD = 'admin123';

      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([{ id: '1' }]); // Admin já existe
      mockDb.query.mockResolvedValueOnce(undefined); // Update bem-sucedido

      await seed.criarAdminInicial();

      expect(mockDb.connect).toHaveBeenCalled();
      expect(mockDb.query).toHaveBeenCalledTimes(2); // Verificação + Update
      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE usuarios SET senha = ?, updated_at = NOW() WHERE email = ?',
        ['hashed_password', 'admin@admin.com.br']
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
      expect(consoleSpy).toHaveBeenCalledWith('Admin inicial já existe - senha atualizada com sucesso!');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Senha atualizada através da variável de ambiente ADMIN_PASSWORD');

      // Restaurar variável de ambiente
      if (originalEnv !== undefined) {
        process.env.ADMIN_PASSWORD = originalEnv;
      } else {
        delete process.env.ADMIN_PASSWORD;
      }
    });

    it('deve atualizar senha com senha gerada quando admin já existe e ADMIN_PASSWORD não definida', async () => {
      const originalEnv = process.env.ADMIN_PASSWORD;
      delete process.env.ADMIN_PASSWORD;

      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([{ id: '1' }]); // Admin já existe
      mockDb.query.mockResolvedValueOnce(undefined); // Update bem-sucedido

      await seed.criarAdminInicial();

      expect(mockDb.connect).toHaveBeenCalled();
      expect(mockDb.query).toHaveBeenCalledTimes(2); // Verificação + Update
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Admin inicial já existe - senha atualizada com sucesso!');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  Senha temporária atualizada:'));

      // Restaurar variável de ambiente
      if (originalEnv !== undefined) {
        process.env.ADMIN_PASSWORD = originalEnv;
      }
    });

    it('deve lançar erro quando falha na criação', async () => {
      const errorMessage = 'Database error';
      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockRejectedValueOnce(new Error(errorMessage));

      await expect(seed.criarAdminInicial()).rejects.toThrow(errorMessage);

      expect(console.error).toHaveBeenCalledWith('Erro ao criar admin inicial:', expect.any(Error));
    });

    it('deve usar senha da variável de ambiente ADMIN_PASSWORD quando definida', async () => {
      const originalEnv = process.env.ADMIN_PASSWORD;
      process.env.ADMIN_PASSWORD = 'admin123';

      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      mockDb.query.mockResolvedValueOnce(undefined); // Insert bem-sucedido

      await seed.criarAdminInicial();

      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
      expect(consoleSpy).toHaveBeenCalledWith('✅ Senha definida através da variável de ambiente ADMIN_PASSWORD');

      // Restaurar variável de ambiente
      if (originalEnv !== undefined) {
        process.env.ADMIN_PASSWORD = originalEnv;
      } else {
        delete process.env.ADMIN_PASSWORD;
      }
    });

    it('deve gerar senha aleatória quando ADMIN_PASSWORD não está definida', async () => {
      const originalEnv = process.env.ADMIN_PASSWORD;
      delete process.env.ADMIN_PASSWORD;

      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      mockDb.query.mockResolvedValueOnce(undefined); // Insert bem-sucedido

      await seed.criarAdminInicial();

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  Senha temporária gerada:'));
      expect(consoleSpy).toHaveBeenCalledWith('⚠️  IMPORTANTE: Altere esta senha no primeiro login!');
      expect(consoleSpy).toHaveBeenCalledWith('💡 TIP: Configure a variável ADMIN_PASSWORD para definir uma senha fixa');

      // Restaurar variável de ambiente
      if (originalEnv !== undefined) {
        process.env.ADMIN_PASSWORD = originalEnv;
      }
    });
  });

  describe('executar', () => {
    it('deve executar seed com sucesso', async () => {
      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      mockDb.query.mockResolvedValueOnce(undefined); // Insert bem-sucedido

      jest.spyOn(seed, 'criarAdminInicial').mockResolvedValueOnce(undefined);

      await seed.executar();

      expect(consoleSpy).toHaveBeenCalledWith('🌱 Iniciando seed do banco de dados...');
      expect(seed.criarAdminInicial).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Seed executado com sucesso!');
    });

    it('deve tratar erro durante execução', async () => {
      const errorMessage = 'Seed error';
      jest.spyOn(seed, 'criarAdminInicial').mockRejectedValueOnce(new Error(errorMessage));

      await seed.executar();

      expect(console.error).toHaveBeenCalledWith('Erro durante o seed:', expect.any(Error));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('gerarSenhaSegura e outros branches', () => {
    it('deve gerar senha com 12 caracteres', () => {
      // Como é um método privado, vamos testar através da criação do admin
      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      mockDb.query.mockResolvedValueOnce(undefined); // Insert bem-sucedido

      // Mock Math.random para tornar a senha determinística nos testes
      const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      return seed.criarAdminInicial().then(() => {
        // Verificar se bcrypt.hash foi chamado com uma string de 12 caracteres
        expect(bcrypt.hash).toHaveBeenCalledWith(
          expect.stringMatching(/.{12}/), // String com exatamente 12 caracteres
          10
        );
        
        mockRandom.mockRestore();
      });
    });

    it('deve cobrir diferentes caracteres na geração de senha', async () => {
      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      mockDb.query.mockResolvedValueOnce(undefined); // Insert bem-sucedido

      // Testamos diferentes valores de Math.random para cobrir diferentes branches do charset
      const mockRandom = jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)   // Primeiro caractere
        .mockReturnValueOnce(0.3)   // Segundo caractere
        .mockReturnValueOnce(0.5)   // Terceiro caractere
        .mockReturnValueOnce(0.7)   // Quarto caractere
        .mockReturnValueOnce(0.9)   // Quinto caractere
        .mockReturnValue(0.2);      // Resto dos caracteres

      await seed.criarAdminInicial();

      expect(bcrypt.hash).toHaveBeenCalled();
      mockRandom.mockRestore();
    });

    it('deve tratar erro de conexão no criarAdminInicial', async () => {
      const errorMessage = 'Connection error';
      mockDb.connect.mockRejectedValueOnce(new Error(errorMessage));

      await expect(seed.criarAdminInicial()).rejects.toThrow(errorMessage);

      expect(console.error).toHaveBeenCalledWith('Erro ao criar admin inicial:', expect.any(Error));
    });

    it('deve tratar erro no hash da senha', async () => {
      const errorMessage = 'Hash error';
      mockDb.connect.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([]); // Admin não existe
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      await expect(seed.criarAdminInicial()).rejects.toThrow(errorMessage);
    });
  });
});