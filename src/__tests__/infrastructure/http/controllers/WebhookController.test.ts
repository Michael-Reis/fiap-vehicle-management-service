import { Request, Response } from 'express';
import { WebhookController } from '../../../../infrastructure/http/controllers/WebhookController';
import { ProcessarWebhookPagamentoUseCase } from '../../../../application/usecases/ProcessarWebhookPagamentoUseCase';

jest.mock('../../../../application/usecases/ProcessarWebhookPagamentoUseCase');

describe('WebhookController', () => {
  let webhookController: WebhookController;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockProcessarWebhookUseCase: jest.Mocked<ProcessarWebhookPagamentoUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockRequest = {
      body: {}
    };

    webhookController = new WebhookController();
    mockProcessarWebhookUseCase = (webhookController as any).processarWebhookPagamentoUseCase;
  });

  describe('processarPagamento', () => {
    const dadosWebhookValidos = {
      codigoPagamento: 'PAY_123456',
      status: 'aprovado',
      veiculoId: 'veh_123',
      cpfComprador: '11144477735',
      valorPago: 85000,
      metodoPagamento: 'PIX',
      dataTransacao: '2023-01-15T10:30:00Z'
    };

    it('deve processar webhook de pagamento com sucesso', async () => {
      const resultadoProcessamento = {
        success: true,
        message: 'Pagamento processado com sucesso',
        veiculoId: 'veh_123',
        status: 'approved'
      };

      mockRequest.body = dadosWebhookValidos;
      mockProcessarWebhookUseCase.execute = jest.fn().mockResolvedValue(resultadoProcessamento);

      await webhookController.processarPagamento(mockRequest as Request, mockResponse as Response);

      expect(mockProcessarWebhookUseCase.execute).toHaveBeenCalledWith(dadosWebhookValidos);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(resultadoProcessamento);
    });

    it('deve retornar erro 400 para dados obrigatórios faltando', async () => {
      mockRequest.body = {
        codigoPagamento: 'PAY_123456'
        // status e veiculoId faltando
      };

      await webhookController.processarPagamento(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados obrigatórios faltando',
        details: 'codigoPagamento, status e veiculoId são obrigatórios'
      });
      expect(mockProcessarWebhookUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve tratar erro do use case', async () => {
      mockRequest.body = dadosWebhookValidos;
      mockProcessarWebhookUseCase.execute = jest.fn().mockRejectedValue(new Error('Veículo não encontrado'));

      await webhookController.processarPagamento(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Veículo não encontrado',
        success: false
      });
    });

    it('deve tratar erro interno do servidor', async () => {
      mockRequest.body = dadosWebhookValidos;
      mockProcessarWebhookUseCase.execute = jest.fn().mockRejectedValue(new Error('Erro no banco de dados'));

      await webhookController.processarPagamento(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro no banco de dados',
        success: false
      });
    });

    it('deve processar pagamento rejeitado', async () => {
      const dadosRejeicao = {
        ...dadosWebhookValidos,
        status: 'rejeitado'
      };

      const resultadoRejeicao = {
        success: false,
        message: 'Pagamento rejeitado',
        veiculoId: 'veh_123',
        status: 'rejeitado'
      };

      mockRequest.body = dadosRejeicao;
      mockProcessarWebhookUseCase.execute = jest.fn().mockResolvedValue(resultadoRejeicao);

      await webhookController.processarPagamento(mockRequest as Request, mockResponse as Response);

      expect(mockProcessarWebhookUseCase.execute).toHaveBeenCalledWith(dadosRejeicao);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(resultadoRejeicao);
    });

    it('deve processar pagamento pendente', async () => {
      const dadosPendente = {
        ...dadosWebhookValidos,
        status: 'pendente'
      };

      const resultadoPendente = {
        success: true,
        message: 'Pagamento pendente',
        veiculoId: 'veh_123',
        status: 'pendente'
      };

      mockRequest.body = dadosPendente;
      mockProcessarWebhookUseCase.execute = jest.fn().mockResolvedValue(resultadoPendente);

      await webhookController.processarPagamento(mockRequest as Request, mockResponse as Response);

      expect(mockProcessarWebhookUseCase.execute).toHaveBeenCalledWith(dadosPendente);
      expect(mockResponse.json).toHaveBeenCalledWith(resultadoPendente);
    });
  });
});
