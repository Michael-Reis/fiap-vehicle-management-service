import { Veiculo, StatusVeiculo } from '../entities/Veiculo';

export type OrdemClassificacao = 'ASC' | 'DESC';

export interface VeiculoRepository {
  salvar(veiculo: Veiculo): Promise<Veiculo>;
  buscarPorId(id: string): Promise<Veiculo | null>;
  buscarTodos(): Promise<Veiculo[]>;
  buscarPorStatus(status: StatusVeiculo): Promise<Veiculo[]>;
  buscarDisponiveis(ordem: OrdemClassificacao): Promise<Veiculo[]>;
  buscarVendidos(ordem: OrdemClassificacao): Promise<Veiculo[]>;
  atualizar(id: string, veiculo: Partial<Veiculo>): Promise<Veiculo>;
  deletar(id: string): Promise<void>;
  existePorId(id: string): Promise<boolean>;
}

export interface FiltrosVeiculo {
  marca?: string;
  modelo?: string;
  anoMin?: number;
  anoMax?: number;
  precoMin?: number;
  precoMax?: number;
  cor?: string;
  status?: StatusVeiculo;
}
