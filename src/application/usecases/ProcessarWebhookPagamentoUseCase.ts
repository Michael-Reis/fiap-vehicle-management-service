import { VeiculoRepository } from '../../domain/repositories/VeiculoRepository';
import { VeiculoRepositoryImpl } from '../../infrastructure/repositories/VeiculoRepositoryImpl';
import { StatusVeiculo } from '../../domain/entities/Veiculo';

export interface ProcessarWebhookPagamentoInput {
  codigoPagamento: string;
  status: 'aprovado' | 'rejeitado' | 'pendente' | 'cancelado';
  veiculoId: string;
  cpfComprador?: string;
  valorPago?: number;
  metodoPagamento?: string;
  dataTransacao?: string;
}

export interface ProcessarWebhookPagamentoOutput {
  sucesso: boolean;
  mensagem: string;
  veiculoId: string;
  novoStatus: StatusVeiculo;
  dataVenda?: Date;
}

export class ProcessarWebhookPagamentoUseCase {
  private veiculoRepository: VeiculoRepository;

  constructor() {
    this.veiculoRepository = new VeiculoRepositoryImpl();
  }

  async execute(input: ProcessarWebhookPagamentoInput): Promise<ProcessarWebhookPagamentoOutput> {
    const veiculo = await this.veiculoRepository.buscarPorId(input.veiculoId);
    
    if (!veiculo) {
      throw new Error('Veículo não encontrado');
    }

    // Verificar se o veículo está disponível
    if (veiculo.status === StatusVeiculo.VENDIDO) {
      throw new Error('Veículo já foi vendido');
    }

    let novoStatus: StatusVeiculo;
    let mensagem: string;
    let dataVenda: Date | undefined;

    switch (input.status) {
      case 'aprovado':
        // Validar valor pago
        if (input.valorPago === undefined || input.valorPago === null) {
          throw new Error('Valor pago é obrigatório para pagamentos aprovados');
        }
        
        if (input.valorPago !== veiculo.preco) {
          throw new Error(
            `Valor pago (R$ ${input.valorPago.toFixed(2)}) não confere com o preço do veículo (R$ ${veiculo.preco.toFixed(2)})`
          );
        }

        novoStatus = StatusVeiculo.VENDIDO;
        mensagem = 'Pagamento aprovado. Veículo vendido com sucesso!';
        dataVenda = new Date();
        
        // Atualizar veículo com dados da venda
        await this.veiculoRepository.atualizar(input.veiculoId, {
          status: novoStatus,
          cpfComprador: input.cpfComprador,
          dataVenda: dataVenda,
          codigoPagamento: input.codigoPagamento
        } as any);
        break;

      case 'rejeitado':
      case 'cancelado':
        novoStatus = StatusVeiculo.A_VENDA;
        mensagem = 'Pagamento rejeitado/cancelado. Veículo voltou ao estoque.';
        
        await this.veiculoRepository.atualizar(input.veiculoId, {
          status: novoStatus,
          cpfComprador: undefined,
          dataVenda: undefined,
          codigoPagamento: undefined
        } as any);
        break;

      case 'pendente':
        novoStatus = StatusVeiculo.RESERVADO;
        mensagem = 'Pagamento pendente. Veículo reservado temporariamente.';
        
        await this.veiculoRepository.atualizar(input.veiculoId, {
          status: novoStatus,
          codigoPagamento: input.codigoPagamento
        } as any);
        break;

      default:
        throw new Error(`Status de pagamento inválido: ${input.status}`);
    }

    return {
      sucesso: true,
      mensagem,
      veiculoId: input.veiculoId,
      novoStatus,
      dataVenda
    };
  }
}
