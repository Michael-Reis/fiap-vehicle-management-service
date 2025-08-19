import { Request, Response } from 'express';
import { ProcessarWebhookPagamentoUseCase } from '../../../application/usecases';

export class WebhookController {
  private processarWebhookPagamentoUseCase: ProcessarWebhookPagamentoUseCase;

  constructor() {
    this.processarWebhookPagamentoUseCase = new ProcessarWebhookPagamentoUseCase();
  }

  async processarPagamento(req: Request, res: Response): Promise<void> {
    try {
      const { 
        codigoPagamento, 
        status, 
        veiculoId, 
        cpfComprador, 
        valorPago, 
        metodoPagamento,
        dataTransacao 
      } = req.body;

      // Validações básicas
      if (!codigoPagamento || !status || !veiculoId) {
        res.status(400).json({ 
          error: 'Dados obrigatórios faltando',
          details: 'codigoPagamento, status e veiculoId são obrigatórios'
        });
        return;
      }

      // Validar status
      const statusValidos = ['aprovado', 'rejeitado', 'pendente', 'cancelado'];
      if (!statusValidos.includes(status)) {
        res.status(400).json({ 
          error: 'Status inválido',
          details: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
        });
        return;
      }

      // Validar CPF para pagamentos aprovados
      if (status === 'aprovado' && !cpfComprador) {
        res.status(400).json({ 
          error: 'CPF do comprador é obrigatório para pagamentos aprovados'
        });
        return;
      }

      // Validar valor pago para pagamentos aprovados
      if (status === 'aprovado' && (valorPago === undefined || valorPago === null || valorPago <= 0)) {
        res.status(400).json({ 
          error: 'Valor pago é obrigatório e deve ser maior que zero para pagamentos aprovados'
        });
        return;
      }

      const result = await this.processarWebhookPagamentoUseCase.execute({
        codigoPagamento,
        status,
        veiculoId,
        cpfComprador,
        valorPago,
        metodoPagamento,
        dataTransacao
      });

      // Log para auditoria
      console.log(`🔔 Webhook processado: ${status} para veículo ${veiculoId}`, {
        codigoPagamento,
        novoStatus: result.novoStatus,
        dataVenda: result.dataVenda
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ Erro ao processar webhook de pagamento:', error);
      
      // Determinar o código de erro baseado na mensagem
      let statusCode = 500;
      if (error.message.includes('não encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('já foi vendido') || error.message.includes('inválido')) {
        statusCode = 400;
      }

      res.status(statusCode).json({ 
        error: error.message || 'Erro ao processar webhook de pagamento',
        success: false
      });
    }
  }

  async obterStatusPagamento(req: Request, res: Response): Promise<void> {
    try {
      const { veiculoId } = req.params;

      if (!veiculoId) {
        res.status(400).json({ 
          error: 'ID do veículo é obrigatório'
        });
        return;
      }

      // Aqui você poderia consultar um serviço de pagamento externo
      // Por enquanto, vamos retornar o status do veículo
      res.status(200).json({ 
        message: 'Endpoint para consultar status de pagamento',
        veiculoId,
        note: 'Implemente a integração com seu provedor de pagamento aqui'
      });
    } catch (error: any) {
      console.error('Erro ao consultar status de pagamento:', error);
      res.status(500).json({ 
        error: error.message || 'Erro ao consultar status de pagamento'
      });
    }
  }
}
