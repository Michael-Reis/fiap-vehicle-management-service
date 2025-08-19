import { ConsultarVeiculoUseCase, FiltrosVeiculo } from '../../../application/usecases/ConsultarVeiculoUseCase';
import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';
import { OrdemClassificacao } from '../../../domain/repositories/VeiculoRepository';

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

  const criarVeiculoMock = (overrides: Partial<any> = {}) => {
    return new Veiculo({
      id: 'veh_123',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2020,
      cor: 'Branco',
      preco: 85000,
      status: StatusVeiculo.A_VENDA,
      ...overrides
    });
  };

  describe('execute', () => {
    it('deve consultar veículo por ID com sucesso', async () => {
      const veiculoMock = criarVeiculoMock();
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
        cpfComprador: undefined,
        dataVenda: undefined,
        createdAt: veiculoMock.createdAt,
        updatedAt: veiculoMock.updatedAt
      });
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
    });

    it('deve retornar null quando veículo não for encontrado', async () => {
      mockVeiculoRepository.buscarPorId.mockResolvedValue(null);

      const result = await consultarVeiculoUseCase.execute({ id: 'inexistente' });

      expect(result).toBeNull();
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('inexistente');
    });

    it('deve retornar veículo vendido com dados do comprador', async () => {
      const veiculoVendido = criarVeiculoMock({
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '12345678909', // CPF válido
        dataVenda: new Date('2023-12-01')
      });
      
      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoVendido);

      const result = await consultarVeiculoUseCase.execute({ id: 'veh_123' });

      expect(result?.status).toBe(StatusVeiculo.VENDIDO);
      expect(result?.cpfComprador).toBe('12345678909');
      expect(result?.dataVenda).toEqual(new Date('2023-12-01'));
      expect(result?.disponivel).toBe(false);
    });
  });

  describe('buscarPorId', () => {
    it('deve chamar execute com o ID fornecido', async () => {
      const veiculoMock = criarVeiculoMock();
      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoMock);

      const result = await consultarVeiculoUseCase.buscarPorId('veh_456');

      expect(result).toBeDefined();
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_456');
    });
  });

  describe('listarComFiltros', () => {
    const veiculos = [
      criarVeiculoMock({ id: 'veh_1', marca: 'Toyota', preco: 50000, ano: 2020 }),
      criarVeiculoMock({ id: 'veh_2', marca: 'Honda', preco: 60000, ano: 2021 }),
      criarVeiculoMock({ id: 'veh_3', marca: 'Ford', preco: 70000, ano: 2022 })
    ];

    it('deve buscar veículos com status A_VENDA e ordem', async () => {
      mockVeiculoRepository.buscarDisponiveis.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = {
        status: StatusVeiculo.A_VENDA,
        ordem: 'ASC' as OrdemClassificacao
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(mockVeiculoRepository.buscarDisponiveis).toHaveBeenCalledWith('ASC');
      expect(result).toHaveLength(3);
    });

    it('deve buscar veículos com status VENDIDO e ordem', async () => {
      mockVeiculoRepository.buscarVendidos.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = {
        status: StatusVeiculo.VENDIDO,
        ordem: 'DESC' as OrdemClassificacao
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(mockVeiculoRepository.buscarVendidos).toHaveBeenCalledWith('DESC');
      expect(result).toHaveLength(3);
    });

    it('deve filtrar por marca', async () => {
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = {
        marca: 'Toyota'
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(1);
      expect(result[0].marca).toBe('Toyota');
    });

    it('deve filtrar por faixa de preço', async () => {
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = {
        precoMin: 55000,
        precoMax: 65000
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(1);
      expect(result[0].preco).toBe(60000);
    });

    it('deve filtrar por faixa de ano', async () => {
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = {
        anoMin: 2021,
        anoMax: 2022
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(2);
      expect(result.every(v => v.ano >= 2021 && v.ano <= 2022)).toBe(true);
    });

    it('deve filtrar por modelo', async () => {
      const veiculosComModelos = [
        criarVeiculoMock({ id: 'veh_1', modelo: 'Corolla' }),
        criarVeiculoMock({ id: 'veh_2', modelo: 'Civic' }),
        criarVeiculoMock({ id: 'veh_3', modelo: 'Corolla Cross' })
      ];
      
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculosComModelos);

      const filtros: FiltrosVeiculo = {
        modelo: 'Corolla'
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(2);
      expect(result.every(v => v.modelo.includes('Corolla'))).toBe(true);
    });

    it('deve aplicar múltiplos filtros simultaneamente', async () => {
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = {
        marca: 'Honda',
        precoMin: 50000,
        precoMax: 70000,
        anoMin: 2021
      };

      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(1);
      expect(result[0].marca).toBe('Honda');
      expect(result[0].preco).toBe(60000);
      expect(result[0].ano).toBe(2021);
    });
  });

  describe('listarDisponiveis', () => {
    it('deve listar veículos disponíveis em ordem ASC por padrão', async () => {
      const veiculosDisponiveis = [criarVeiculoMock(), criarVeiculoMock({ id: 'veh_2' })];
      mockVeiculoRepository.buscarDisponiveis.mockResolvedValue(veiculosDisponiveis);

      const result = await consultarVeiculoUseCase.listarDisponiveis();

      expect(mockVeiculoRepository.buscarDisponiveis).toHaveBeenCalledWith('ASC');
      expect(result).toHaveLength(2);
    });

    it('deve listar veículos disponíveis em ordem DESC', async () => {
      const veiculosDisponiveis = [criarVeiculoMock()];
      mockVeiculoRepository.buscarDisponiveis.mockResolvedValue(veiculosDisponiveis);

      const result = await consultarVeiculoUseCase.listarDisponiveis('DESC');

      expect(mockVeiculoRepository.buscarDisponiveis).toHaveBeenCalledWith('DESC');
      expect(result).toHaveLength(1);
    });

    it('deve retornar lista vazia quando não há veículos disponíveis', async () => {
      mockVeiculoRepository.buscarDisponiveis.mockResolvedValue([]);

      const result = await consultarVeiculoUseCase.listarDisponiveis();

      expect(result).toHaveLength(0);
    });

    it('deve listar com outras ordenações válidas', async () => {
      const veiculosDisponiveis = [criarVeiculoMock()];
      mockVeiculoRepository.buscarDisponiveis.mockResolvedValue(veiculosDisponiveis);

      await consultarVeiculoUseCase.listarDisponiveis('ASC');
      expect(mockVeiculoRepository.buscarDisponiveis).toHaveBeenCalledWith('ASC');

      await consultarVeiculoUseCase.listarDisponiveis('DESC');
      expect(mockVeiculoRepository.buscarDisponiveis).toHaveBeenCalledWith('DESC');
    });

    it('deve lidar com erro no repository', async () => {
      mockVeiculoRepository.buscarDisponiveis.mockRejectedValue(new Error('Erro no banco'));

      await expect(consultarVeiculoUseCase.listarDisponiveis()).rejects.toThrow('Erro no banco');
    });
  });

  describe('edge cases', () => {
    it('deve listar veículos disponíveis com ordenação DESC', async () => {
      const veiculosDisponiveis = [criarVeiculoMock({ status: StatusVeiculo.A_VENDA })];
      mockVeiculoRepository.buscarDisponiveis.mockResolvedValue(veiculosDisponiveis);

      const result = await consultarVeiculoUseCase.listarDisponiveis('DESC');

      expect(mockVeiculoRepository.buscarDisponiveis).toHaveBeenCalledWith('DESC');
      expect(result).toHaveLength(1);
      expect(result[0].disponivel).toBe(true);
    });

    it('deve listar veículos vendidos com ordenação ASC', async () => {
      const veiculosVendidos = [criarVeiculoMock({ status: StatusVeiculo.VENDIDO })];
      mockVeiculoRepository.buscarVendidos.mockResolvedValue(veiculosVendidos);

      const result = await consultarVeiculoUseCase.listarVendidos('ASC');

      expect(mockVeiculoRepository.buscarVendidos).toHaveBeenCalledWith('ASC');
      expect(result).toHaveLength(1);
    });

    it('deve usar buscarPorId através do método auxiliar', async () => {
      const veiculoMock = criarVeiculoMock();
      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculoMock);

      const result = await consultarVeiculoUseCase.buscarPorId('veh_123');

      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
      expect(result).toBeDefined();
      expect(result?.id).toBe('veh_123');
    });

    it('deve filtrar por marca e modelo simultaneamente', async () => {
      const veiculosEncontrados = [
        criarVeiculoMock({ marca: 'Honda', modelo: 'Civic' }),
        criarVeiculoMock({ marca: 'Toyota', modelo: 'Corolla' })
      ];
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculosEncontrados);

      const filtros: FiltrosVeiculo = { marca: 'Honda', modelo: 'Civic' };
      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(1);
      expect(result[0].marca).toBe('Honda');
      expect(result[0].modelo).toBe('Civic');
    });

    it('deve lidar com resultado vazio para ID inexistente', async () => {
      mockVeiculoRepository.buscarPorId.mockResolvedValue(null);

      const result = await consultarVeiculoUseCase.execute({ id: 'inexistente' });

      expect(result).toBeNull();
    });

    it('deve lidar com erro ao buscar veículos disponíveis', async () => {
      mockVeiculoRepository.buscarDisponiveis.mockRejectedValue(new Error('Erro na consulta'));

      await expect(consultarVeiculoUseCase.listarDisponiveis('ASC'))
        .rejects.toThrow('Erro na consulta');
    });

    it('deve aplicar filtros de preço corretamente', async () => {
      const veiculos = [
        criarVeiculoMock({ preco: 30000 }),
        criarVeiculoMock({ preco: 50000 }),
        criarVeiculoMock({ preco: 70000 })
      ];
      mockVeiculoRepository.buscarTodos.mockResolvedValue(veiculos);

      const filtros: FiltrosVeiculo = { precoMin: 40000, precoMax: 60000 };
      const result = await consultarVeiculoUseCase.listarComFiltros(filtros);

      expect(result).toHaveLength(1);
      expect(result[0].preco).toBe(50000);
    });
  });
});
