export interface NotificacaoVendaService {
  notificarVendaConcluida(veiculoId: string, cpfComprador: string, codigoPagamento: string): Promise<void>;
  notificarVendaCancelada(veiculoId: string, codigoPagamento: string): Promise<void>;
}

export interface ConsultaVeiculoService {
  verificarDisponibilidade(veiculoId: string): Promise<boolean>;
  obterDadosVeiculo(veiculoId: string): Promise<any>;
}
