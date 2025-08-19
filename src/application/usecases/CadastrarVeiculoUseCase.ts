import { Veiculo, VeiculoProps, StatusVeiculo } from '../../domain/entities/Veiculo';
import { VeiculoRepository } from '../../domain/repositories/VeiculoRepository';
import { VeiculoRepositoryImpl } from '../../infrastructure/repositories/VeiculoRepositoryImpl';

export interface CadastrarVeiculoInput {
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
  descricao?: string;
}

export interface CadastrarVeiculoOutput {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
  status: StatusVeiculo;
  createdAt: Date;
}

export class CadastrarVeiculoUseCase {
  private veiculoRepository: VeiculoRepository;

  constructor() {
    this.veiculoRepository = new VeiculoRepositoryImpl();
  }

  async execute(input: CadastrarVeiculoInput): Promise<CadastrarVeiculoOutput> {
    const veiculoProps: VeiculoProps = {
      marca: input.marca.trim(),
      modelo: input.modelo.trim(),
      ano: input.ano,
      cor: input.cor.trim(),
      preco: input.preco,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(veiculoProps);
    const veiculoSalvo = await this.veiculoRepository.salvar(veiculo);

    return {
      id: veiculoSalvo.id,
      marca: veiculoSalvo.marca,
      modelo: veiculoSalvo.modelo,
      ano: veiculoSalvo.ano,
      cor: veiculoSalvo.cor,
      preco: veiculoSalvo.preco,
      status: veiculoSalvo.status,
      createdAt: veiculoSalvo.createdAt
    };
  }
}
