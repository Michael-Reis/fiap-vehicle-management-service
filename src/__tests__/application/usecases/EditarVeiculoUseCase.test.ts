import { EditarVeiculoUseCase } from '../../../application/usecases/EditarVeiculoUseCase';
import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';

jest.mock('../../../infrastructure/repositories/VeiculoRepositoryImpl');

describe('EditarVeiculoUseCase', () => {
  let editarVeiculoUseCase: EditarVeiculoUseCase;
  let mockVeiculoRepository: jest.Mocked<VeiculoRepositoryImpl>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVeiculoRepository = new VeiculoRepositoryImpl() as jest.Mocked<VeiculoRepositoryImpl>;
    editarVeiculoUseCase = new EditarVeiculoUseCase();
    (editarVeiculoUseCase as any).veiculoRepository = mockVeiculoRepository;
  });

  describe('execute', () => {
    const inputValido = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2021,
      cor: 'Azul',
      preco: 90000
    };

    it('deve editar veículo com sucesso', async () => {
      const veiculoExistente = new Veiculo({
        id: 'veh_123',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      const veiculoEditado = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2021,
        cor: 'Azul',
        preco: 90000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoExistente);
      mockVeiculoRepository.atualizar.mockResolvedValue(veiculoEditado);

      const result = await editarVeiculoUseCase.execute('veh_123', inputValido);

      expect(result).toEqual({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2021,
        cor: 'Azul',
        preco: 90000,
        status: StatusVeiculo.A_VENDA,
        updatedAt: veiculoEditado.updatedAt
      });
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalled();
    });

    it('deve lançar erro quando veículo não for encontrado', async () => {
      mockVeiculoRepository.buscarPorId.mockResolvedValue(null);

      await expect(editarVeiculoUseCase.execute('veh_123', inputValido))
        .rejects
        .toThrow('Veículo não encontrado');

      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
      expect(mockVeiculoRepository.atualizar).not.toHaveBeenCalled();
    });

    it('deve editar apenas campos fornecidos', async () => {
      const inputParcial = {
        preco: 95000
      };

      const veiculoExistente = new Veiculo({
        id: 'veh_123',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      const veiculoEditado = new Veiculo({
        id: 'veh_123',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
        cor: 'Branco',
        preco: 95000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoExistente);
      mockVeiculoRepository.atualizar.mockResolvedValue(veiculoEditado);

      const result = await editarVeiculoUseCase.execute('veh_123', inputParcial);

      expect(result.preco).toBe(95000);
      expect(result.marca).toBe('Honda'); // Deve manter o valor original
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalledWith('veh_123', { preco: 95000 });
    });

    it('deve tratar erro no repositório', async () => {
      const veiculoExistente = new Veiculo({
        id: 'veh_123',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoExistente);
      mockVeiculoRepository.atualizar.mockRejectedValue(new Error('Erro no banco de dados'));

      await expect(editarVeiculoUseCase.execute('veh_123', inputValido))
        .rejects
        .toThrow('Erro no banco de dados');
    });
  });
});
