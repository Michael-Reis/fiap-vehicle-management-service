import { ConsultarVeiculoUseCase } from '../../../application/usecases/ConsultarVeiculoUseCase';
import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';

jest.mock('../../../infrastructure/repositories/VeiculoRepositoryImpl');

describe('ConsultarVeiculoUseCase', () => {
  let consultarVeiculoUseCase: ConsultarVeiculoUseCase;
  let mockVeiculoRepository: jest.Mocked<VeiculoRepositoryImpl>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVeiculoRepository = new VeiculoRepositoryImpl() as jest.Mocked<VeiculoRepositoryImpl>;
    consultarVeiculoUseCase = new ConsultarVeiculoUseCase();
    (consultarVeiculoUseCase as any).veiculoRepository = mockVeiculoRepository;
  });

  describe('execute', () => {
    it('deve consultar veículo por ID com sucesso', async () => {
      const veiculoMock = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoMock);

      const result = await consultarVeiculoUseCase.execute({ id: 'veh_123' });

      expect(result).toEqual({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA,
        disponivel: true,
        createdAt: veiculoMock.createdAt,
        updatedAt: veiculoMock.updatedAt
      });
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
    });

    it('deve retornar null quando veículo não for encontrado', async () => {
      mockVeiculoRepository.buscarPorId.mockResolvedValue(null);

      const result = await consultarVeiculoUseCase.execute({ id: 'veh_inexistente' });

      expect(result).toBeNull();
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_inexistente');
    });

    it('deve consultar veículo vendido com dados do comprador', async () => {
      const veiculoVendido = new Veiculo({
        id: 'veh_456',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2021,
        cor: 'Prata',
        preco: 95000,
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '11144477735', // CPF válido
        dataVenda: new Date('2023-01-15')
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoVendido);

      const result = await consultarVeiculoUseCase.execute({ id: 'veh_456' });

      expect(result).toEqual({
        id: 'veh_456',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2021,
        cor: 'Prata',
        preco: 95000,
        status: StatusVeiculo.VENDIDO,
        disponivel: false,
        cpfComprador: '11144477735',
        dataVenda: veiculoVendido.dataVenda,
        createdAt: veiculoVendido.createdAt,
        updatedAt: veiculoVendido.updatedAt
      });
    });
  });
});
