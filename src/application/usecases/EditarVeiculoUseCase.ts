import { VeiculoRepository } from '../../domain/repositories/VeiculoRepository';
import { VeiculoRepositoryImpl } from '../../infrastructure/repositories/VeiculoRepositoryImpl';

export interface EditarVeiculoInput {
  id?: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  cor?: string;
  preco?: number;
  descricao?: string;
}

export interface EditarVeiculoOutput {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
  status: string;
  updatedAt: Date;
}

export class EditarVeiculoUseCase {
  private veiculoRepository: VeiculoRepository;

  constructor() {
    this.veiculoRepository = new VeiculoRepositoryImpl();
  }

  async execute(id: string, input: EditarVeiculoInput): Promise<EditarVeiculoOutput> {
    const veiculo = await this.veiculoRepository.buscarPorId(id);
    
    if (!veiculo) {
      throw new Error('Veículo não encontrado');
    }

    // Atualizar apenas os campos fornecidos
    const dadosAtualizacao: any = {};
    if (input.marca !== undefined) dadosAtualizacao.marca = input.marca;
    if (input.modelo !== undefined) dadosAtualizacao.modelo = input.modelo;
    if (input.ano !== undefined) dadosAtualizacao.ano = input.ano;
    if (input.cor !== undefined) dadosAtualizacao.cor = input.cor;
    if (input.preco !== undefined) dadosAtualizacao.preco = input.preco;
    if (input.descricao !== undefined) dadosAtualizacao.descricao = input.descricao;

    const veiculoAtualizado = await this.veiculoRepository.atualizar(id, dadosAtualizacao);

    return {
      id: veiculoAtualizado.id,
      marca: veiculoAtualizado.marca,
      modelo: veiculoAtualizado.modelo,
      ano: veiculoAtualizado.ano,
      cor: veiculoAtualizado.cor,
      preco: veiculoAtualizado.preco,
      status: veiculoAtualizado.status,
      updatedAt: veiculoAtualizado.updatedAt
    };
  }

  async deletar(id: string): Promise<void> {
    const veiculo = await this.veiculoRepository.buscarPorId(id);
    
    if (!veiculo) {
      throw new Error('Veículo não encontrado');
    }

    await this.veiculoRepository.deletar(id);
  }
}
