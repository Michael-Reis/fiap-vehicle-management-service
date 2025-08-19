import { ProcessarWebhookPagamentoUseCase } from '../../../application/usecases/ProcessarWebhookPagamentoUseCase';
import { VeiculoRepositoryImpl } from '../../../infrastructure/repositories/VeiculoRepositoryImpl';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';

jest.mock('../../../infrastructure/repositories/VeiculoRepositoryImpl');

describe('ProcessarWebhookPagamentoUseCase - Coverage', () => {
  let processarWebhookUseCase: ProcessarWebhookPagamentoUseCase;
  let mockVeiculoRepository: jest.Mocked<VeiculoRepositoryImpl>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockVeiculoRepository = new VeiculoRepositoryImpl() as jest.Mocked<VeiculoRepositoryImpl>;
    processarWebhookUseCase = new ProcessarWebhookPagamentoUseCase();
    (processarWebhookUseCase as any).veiculoRepository = mockVeiculoRepository;
  });

  describe('execute - branches de validação', () => {
    it('deve lançar erro quando veículo não encontrado', async () => {
      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(null);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'aprovado' as const,
        veiculoId: 'veh_inexistente'
      };

      await expect(processarWebhookUseCase.execute(input))
        .rejects.toThrow('Veículo não encontrado');
    });

    it('deve lançar erro quando veículo já foi vendido', async () => {
      const veiculoVendido = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.VENDIDO
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculoVendido);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'aprovado' as const,
        veiculoId: 'veh_123'
      };

      await expect(processarWebhookUseCase.execute(input))
        .rejects.toThrow('Veículo já foi vendido');
    });

    it('deve lançar erro quando valorPago é undefined para status aprovado', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'aprovado' as const,
        veiculoId: 'veh_123',
        valorPago: undefined
      };

      await expect(processarWebhookUseCase.execute(input))
        .rejects.toThrow('Valor pago é obrigatório para pagamentos aprovados');
    });

    it('deve lançar erro quando valorPago é null para status aprovado', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'aprovado' as const,
        veiculoId: 'veh_123',
        valorPago: null as any
      };

      await expect(processarWebhookUseCase.execute(input))
        .rejects.toThrow('Valor pago é obrigatório para pagamentos aprovados');
    });

    it('deve lançar erro quando valorPago não confere com preço do veículo', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'aprovado' as const,
        veiculoId: 'veh_123',
        valorPago: 80000 // Valor diferente
      };

      await expect(processarWebhookUseCase.execute(input))
        .rejects.toThrow('Valor pago (R$ 80000.00) não confere com o preço do veículo (R$ 85000.00)');
    });

    it('deve processar status rejeitado', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.RESERVADO
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);
      mockVeiculoRepository.atualizar.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'rejeitado' as const,
        veiculoId: 'veh_123'
      };

      const resultado = await processarWebhookUseCase.execute(input);

      expect(resultado.novoStatus).toBe(StatusVeiculo.A_VENDA);
      expect(resultado.mensagem).toBe('Pagamento rejeitado/cancelado. Veículo voltou ao estoque.');
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalledWith('veh_123', {
        status: StatusVeiculo.A_VENDA,
        cpfComprador: undefined,
        dataVenda: undefined,
        codigoPagamento: undefined
      });
    });

    it('deve processar status cancelado', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.RESERVADO
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);
      mockVeiculoRepository.atualizar.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'cancelado' as const,
        veiculoId: 'veh_123'
      };

      const resultado = await processarWebhookUseCase.execute(input);

      expect(resultado.novoStatus).toBe(StatusVeiculo.A_VENDA);
      expect(resultado.mensagem).toBe('Pagamento rejeitado/cancelado. Veículo voltou ao estoque.');
    });

    it('deve processar status pendente', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);
      mockVeiculoRepository.atualizar.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'pendente' as const,
        veiculoId: 'veh_123'
      };

      const resultado = await processarWebhookUseCase.execute(input);

      expect(resultado.novoStatus).toBe(StatusVeiculo.RESERVADO);
      expect(resultado.mensagem).toBe('Pagamento pendente. Veículo reservado temporariamente.');
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalledWith('veh_123', {
        status: StatusVeiculo.RESERVADO,
        codigoPagamento: 'PAY_123'
      });
    });

    it('deve lançar erro para status inválido', async () => {
      const veiculo = new Veiculo({
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2020,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA
      });

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'status_invalido' as any,
        veiculoId: 'veh_123'
      };

      await expect(processarWebhookUseCase.execute(input))
        .rejects.toThrow('Status de pagamento inválido: status_invalido');
    });

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

      mockVeiculoRepository.buscarPorId.mockResolvedValueOnce(veiculo);
      mockVeiculoRepository.atualizar.mockResolvedValueOnce(veiculo);

      const input = {
        codigoPagamento: 'PAY_123',
        status: 'aprovado' as const,
        veiculoId: 'veh_123',
        cpfComprador: '12345678901',
        valorPago: 85000
      };

      const resultado = await processarWebhookUseCase.execute(input);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.novoStatus).toBe(StatusVeiculo.VENDIDO);
      expect(resultado.mensagem).toBe('Pagamento aprovado. Veículo vendido com sucesso!');
      expect(resultado.dataVenda).toBeInstanceOf(Date);
      expect(mockVeiculoRepository.atualizar).toHaveBeenCalledWith('veh_123', {
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '12345678901',
        dataVenda: expect.any(Date),
        codigoPagamento: 'PAY_123'
      });
    });
  });
});
