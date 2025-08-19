import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';
import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';

// Mock da conexão com banco
jest.mock('../../../infrastructure/database/DatabaseConnection', () => {
  return {
    DatabaseConnection: {
      getInstance: jest.fn()
    }
  };
});

const mockConnection = {
  execute: jest.fn(),
  query: jest.fn(),
  end: jest.fn()
};

describe('VeiculoRepositoryImpl', () => {
  let repository: VeiculoRepositoryImpl;
  let mockExecute: jest.Mock;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockExecute = jest.fn();
    mockQuery = jest.fn();
    
    DatabaseConnection.getInstance = jest.fn().mockReturnValue({
      execute: mockExecute,
      query: mockQuery
    });

    repository = new VeiculoRepositoryImpl();
    jest.clearAllMocks();
  });

  const veiculoMock = new Veiculo({
    id: 'veh_123',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2023,
    cor: 'Branco',
    preco: 85000,
    status: StatusVeiculo.A_VENDA,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  });

  describe('salvar', () => {
    it('deve salvar um veículo no banco de dados', async () => {
      const mockResult = [{ insertId: 1 }];
      mockExecute.mockResolvedValue(mockResult);

      const resultado = await repository.salvar(veiculoMock);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO veiculos'),
        expect.arrayContaining([
          'veh_123',
          'Toyota',
          'Corolla',
          2023,
          'Branco',
          85000,
          'A_VENDA'
        ])
      );

      expect(resultado).toEqual(veiculoMock);
    });

    it('deve tratar erro de banco de dados ao salvar', async () => {
      mockExecute.mockRejectedValue(new Error('Constraint violation'));

      await expect(repository.salvar(veiculoMock)).rejects.toThrow('Constraint violation');
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar veículo por ID', async () => {
      const mockRows = [{
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: 'A_VENDA',
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockQuery.mockResolvedValue(mockRows);

      const resultado = await repository.buscarPorId('veh_123');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM veiculos WHERE id = ?'),
        ['veh_123']
      );

      expect(resultado).toBeInstanceOf(Veiculo);
      expect(resultado?.id).toBe('veh_123');
      expect(resultado?.marca).toBe('Toyota');
    });

    it('deve retornar null quando veículo não encontrado', async () => {
      mockQuery.mockResolvedValue([]);

      const resultado = await repository.buscarPorId('veh_inexistente');
      expect(resultado).toBeNull();
    });
  });

  describe('buscarTodos', () => {
    it('deve buscar todos os veículos', async () => {
      const mockRows = [
        {
          id: 'veh_1',
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2023,
          cor: 'Branco',
          preco: 85000,
          status: 'A_VENDA',
          cpf_comprador: null,
          data_venda: null,
          codigo_pagamento: null,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01')
        },
        {
          id: 'veh_2',
          marca: 'Honda',
          modelo: 'Civic',
          ano: 2023,
          cor: 'Preto',
          preco: 90000,
          status: 'A_VENDA',
          cpf_comprador: null,
          data_venda: null,
          codigo_pagamento: null,
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01')
        }
      ];

      mockQuery.mockResolvedValue(mockRows);

      const resultado = await repository.buscarTodos();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM veiculos')
      );

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toBeInstanceOf(Veiculo);
      expect(resultado[1]).toBeInstanceOf(Veiculo);
    });

    it('deve retornar array vazio quando não há veículos', async () => {
      mockQuery.mockResolvedValue([]);

      const resultado = await repository.buscarTodos();

      expect(resultado).toEqual([]);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um veículo', async () => {
      // Mock para buscarPorId (primeira chamada)
      const mockBuscarResult = [{
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: 'A_VENDA',
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      // Mock para o UPDATE
      const mockUpdateResult = [{ affectedRows: 1 }];
      
      // Mock para buscarPorId (segunda chamada após update)
      const mockBuscarResultAtualizado = [{
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Azul',
        preco: 90000,
        status: 'A_VENDA',
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockQuery
        .mockResolvedValueOnce(mockBuscarResult)  // primeira busca
        .mockResolvedValueOnce(mockBuscarResultAtualizado); // segunda busca após update
      
      mockExecute.mockResolvedValue(mockUpdateResult);

      const resultado = await repository.atualizar('veh_123', {
        preco: 90000,
        cor: 'Azul'
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE veiculos SET'),
        expect.arrayContaining([90000, 'Azul'])
      );

      expect(resultado.preco).toBe(90000);
      expect(resultado.cor).toBe('Azul');
    });

    it('deve lançar erro quando veículo não encontrado para atualização', async () => {
      mockQuery.mockResolvedValue([]); // Retorna array vazio

      await expect(repository.atualizar('veh_inexistente', { preco: 90000 })).rejects.toThrow('Veículo não encontrado');
    });
  });

  describe('deletar', () => {
    it('deve deletar um veículo', async () => {
      const mockResult = [{ affectedRows: 1 }];
      mockExecute.mockResolvedValue(mockResult);

      await repository.deletar('veh_123');

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM veiculos WHERE id = ?'),
        ['veh_123']
      );
    });

    it('deve retornar false quando veículo não encontrado para deletar', async () => {
      const mockResult = [{ affectedRows: 0 }];
      mockExecute.mockResolvedValue(mockResult);

      await repository.deletar('veh_inexistente');

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM veiculos WHERE id = ?'),
        ['veh_inexistente']
      );
    });
  });

  describe('buscarPorStatus', () => {
    it('deve buscar veículos por status', async () => {
      const mockRows = [{
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: 'A_VENDA',
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockQuery.mockResolvedValue(mockRows);

      const resultado = await repository.buscarPorStatus(StatusVeiculo.A_VENDA);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = ?'),
        ['A_VENDA']
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toBeInstanceOf(Veiculo);
    });
  });

  describe('buscarDisponiveis', () => {
    it('deve buscar apenas veículos disponíveis', async () => {
      const mockRows = [{
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: 'A_VENDA',
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockQuery.mockResolvedValue(mockRows);

      const resultado = await repository.buscarDisponiveis();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = ?'),
        ['A_VENDA']
      );

      expect(resultado).toHaveLength(1);
      expect(resultado[0].status).toBe(StatusVeiculo.A_VENDA);
    });
  });

  describe('Tratamento de erros de banco', () => {
    it('deve tratar erro de conexão', async () => {
      mockQuery.mockRejectedValue(new Error('Connection failed'));

      await expect(repository.buscarTodos()).rejects.toThrow('Connection failed');
    });

    it('deve tratar erro de SQL', async () => {
      mockQuery.mockRejectedValue(new Error('SQL syntax error'));

      await expect(repository.buscarTodos()).rejects.toThrow('SQL syntax error');
    });
  });

  describe('Mapeamento de dados', () => {
    it('deve mapear corretamente dados do banco para entidade', async () => {
      const dadoBanco = {
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: 'VENDIDO',
        cpf_comprador: '12345678900',
        data_venda: new Date('2023-06-15'),
        codigo_pagamento: 'PAG123456',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-06-15')
      };

      const mockRows = [dadoBanco];
      mockQuery.mockResolvedValue(mockRows);

      const resultado = await repository.buscarPorId('veh_123');

      expect(resultado?.status).toBe(StatusVeiculo.VENDIDO);
      expect(resultado?.cpfComprador).toBe('12345678900');
      expect(resultado?.dataVenda).toEqual(new Date('2023-06-15'));
      expect(resultado?.codigoPagamento).toBe('PAG123456');
    });
  });
});
