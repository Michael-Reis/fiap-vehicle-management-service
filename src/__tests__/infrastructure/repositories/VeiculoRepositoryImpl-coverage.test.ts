import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';
import { DatabaseConnection } from '../../../infrastructure/database/DatabaseConnection';

// Mock do DatabaseConnection
jest.mock('../../../infrastructure/database/DatabaseConnection');

describe('VeiculoRepositoryImpl - Coverage', () => {
  let repository: VeiculoRepositoryImpl;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDb = {
      query: jest.fn(),
      execute: jest.fn(),
      close: jest.fn(),
    } as any;

    (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockDb);
    repository = new VeiculoRepositoryImpl();
  });

  describe('atualizar', () => {
    it('deve atualizar todos os campos possíveis', async () => {
      const veiculoExistente = {
        id: '1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 50000,
        status: StatusVeiculo.A_VENDA,
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      };

      mockDb.query.mockResolvedValueOnce([veiculoExistente]);
      mockDb.execute.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([{
        ...veiculoExistente,
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2021,
        cor: 'Preto',
        preco: 60000,
        status: StatusVeiculo.VENDIDO,
        cpf_comprador: '12345678901',
        data_venda: new Date('2023-12-01'),
        codigo_pagamento: 'PAG123',
        updated_at: new Date()
      }]);

      const dadosAtualizacao = {
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2021,
        cor: 'Preto',
        preco: 60000,
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '12345678901',
        dataVenda: new Date('2023-12-01'),
        codigoPagamento: 'PAG123'
      };

      const resultado = await repository.atualizar('1', dadosAtualizacao);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE veiculos SET'),
        expect.arrayContaining([
          'Honda', 'Civic', 2021, 'Preto', 60000, StatusVeiculo.VENDIDO,
          '12345678901', dadosAtualizacao.dataVenda, 'PAG123'
        ])
      );
      expect(resultado).toBeInstanceOf(Veiculo);
    });

    it('deve atualizar campos para null quando undefined', async () => {
      const veiculoExistente = {
        id: '1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 50000,
        status: StatusVeiculo.VENDIDO,
        cpf_comprador: '12345678901',
        data_venda: new Date('2023-01-01'),
        codigo_pagamento: 'PAG123',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      };

      mockDb.query.mockResolvedValueOnce([veiculoExistente]);
      mockDb.execute.mockResolvedValueOnce(undefined);
      mockDb.query.mockResolvedValueOnce([{
        ...veiculoExistente,
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        status: StatusVeiculo.A_VENDA,
        updated_at: new Date()
      }]);

      const dadosAtualizacao = {
        status: StatusVeiculo.A_VENDA
      };

      const resultado = await repository.atualizar('1', dadosAtualizacao);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE veiculos SET'),
        expect.arrayContaining([StatusVeiculo.A_VENDA])
      );
    });

    it('deve lançar erro quando veículo não existe', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      await expect(repository.atualizar('999', { marca: 'Honda' }))
        .rejects.toThrow('Veículo não encontrado');
    });
  });

  describe('deletar', () => {
    it('deve deletar veículo existente', async () => {
      const veiculoExistente = {
        id: '1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 50000,
        status: StatusVeiculo.A_VENDA,
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      };

      mockDb.query.mockResolvedValueOnce([veiculoExistente]);
      mockDb.execute.mockResolvedValueOnce(undefined);

      await repository.deletar('1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM veiculos WHERE id = ?',
        ['1']
      );
    });

    it('deve deletar mesmo que veículo não exista', async () => {
      mockDb.execute.mockResolvedValueOnce(undefined);

      await repository.deletar('999');
      
      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM veiculos WHERE id = ?',
        ['999']
      );
    });
  });

  describe('existePorId', () => {
    it('deve retornar true quando veículo existe', async () => {
      mockDb.query.mockResolvedValueOnce([{ count: 1 }]);

      const existe = await repository.existePorId('1');

      expect(existe).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM veiculos WHERE id = ?',
        ['1']
      );
    });

    it('deve retornar false quando veículo não existe', async () => {
      mockDb.query.mockResolvedValueOnce([{ count: 0 }]);

      const existe = await repository.existePorId('999');

      expect(existe).toBe(false);
    });
  });

  describe('buscarDisponiveis', () => {
    it('deve buscar disponíveis ordenados ASC', async () => {
      const veiculosMock = [{
        id: '1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 50000,
        status: StatusVeiculo.A_VENDA,
        cpf_comprador: null,
        data_venda: null,
        codigo_pagamento: null,
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockDb.query.mockResolvedValueOnce(veiculosMock);

      const resultado = await repository.buscarDisponiveis('ASC');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM veiculos'),
        [StatusVeiculo.A_VENDA]
      );
      expect(resultado).toHaveLength(1);
    });

    it('deve buscar disponíveis ordenados DESC', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      await repository.buscarDisponiveis('DESC');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY preco DESC'),
        [StatusVeiculo.A_VENDA]
      );
    });
  });

  describe('buscarVendidos', () => {
    it('deve buscar vendidos ordenados ASC', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      await repository.buscarVendidos('ASC');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY preco ASC'),
        [StatusVeiculo.VENDIDO]
      );
    });

    it('deve buscar vendidos ordenados DESC', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      await repository.buscarVendidos('DESC');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY preco DESC'),
        [StatusVeiculo.VENDIDO]
      );
    });
  });
});