import { ProcessarWebhookPagamentoUseCase } from '../../../application/usecases/ProcessarWebhookPagamentoUseCase';
import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';

jest.mock('../../../infrastructure/repositories/VeiculoRepositoryImpl');

describe('ProcessarWebhookPagamentoUseCase', () => {
  let processarWebhookUseCase: ProcessarWebhookPagamentoUseCase;
  let mockVeiculoRepository: jest.Mocked<VeiculoRepositoryImpl>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVeiculoRepository = new VeiculoRepositoryImpl() as jest.Mocked<VeiculoRepositoryImpl>;
    processarWebhookUseCase = new ProcessarWebhookPagamentoUseCase();
    (processarWebhookUseCase as any).veiculoRepository = mockVeiculoRepository;
  });

  describe('execute', () => {
    const dadosWebhookValidos = {
      codigoPagamento: 'PAY_123456',
      status: 'aprovado' as const,
      veiculoId: 'veh_123',
      cpfComprador: '11144477735',
      valorPago: 85000,
      metodoPagamento: 'PIX',
      dataTransacao: '2023-01-15T10:30:00Z'
    };

    it('deve processar pagamento aprovado com sucesso', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      const veiculoVendido = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '11144477735',
        codigoPagamento: 'PAY_123456'
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculo);
      mockVeiculoRepository.atualizar.mockResolvedValue(veiculoVendido);

      const result = await processarWebhookUseCase.execute(dadosWebhookValidos);

      expect(result).toEqual({
        sucesso: true,
        mensagem: expect.any(String),
        veiculoId: 'veh_123',
        novoStatus: StatusVeiculo.VENDIDO,
        dataVenda: expect.any(Date)
      });
      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalled();
    });

    it('deve processar pagamento rejeitado', async () => {
      const dadosRejeicao = {
        ...dadosWebhookValidos,
        status: 'rejeitado' as const
      };

      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.RESERVADO,
        codigoPagamento: 'PAY_123456'
      });

      const veiculoLiberado = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculo);
      mockVeiculoRepository.atualizar.mockResolvedValue(veiculoLiberado);

      const result = await processarWebhookUseCase.execute(dadosRejeicao);

      expect(result).toEqual({
        sucesso: true,
        mensagem: expect.any(String),
        veiculoId: 'veh_123',
        novoStatus: StatusVeiculo.A_VENDA,
        dataVenda: undefined
      });
    });

    it('deve lançar erro quando veículo não for encontrado', async () => {
      mockVeiculoRepository.buscarPorId.mockResolvedValue(null);

      await expect(processarWebhookUseCase.execute(dadosWebhookValidos))
        .rejects
        .toThrow('Veículo não encontrado');

      expect(mockVeiculoRepository.buscarPorId).toHaveBeenCalledWith('veh_123');
      expect(mockVeiculoRepository.atualizar).not.toHaveBeenCalled();
    });

    it('deve processar pagamento pendente', async () => {
      const dadosPendente = {
        ...dadosWebhookValidos,
        status: 'pendente' as const
      };

      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.RESERVADO,
        codigoPagamento: 'PAY_123456'
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculo);

      const result = await processarWebhookUseCase.execute(dadosPendente);

      expect(result).toEqual({
        sucesso: true,
        mensagem: expect.any(String),
        veiculoId: 'veh_123',
        novoStatus: StatusVeiculo.RESERVADO,
        dataVenda: undefined
      });
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalled();
    });

    it('deve tratar erro no repositório', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValue(veiculo);
      mockVeiculoRepository.atualizar.mockRejectedValue(new Error('Erro no banco de dados'));

      await expect(processarWebhookUseCase.execute(dadosWebhookValidos))
        .rejects
        .toThrow('Erro no banco de dados');
    });
  });
});
