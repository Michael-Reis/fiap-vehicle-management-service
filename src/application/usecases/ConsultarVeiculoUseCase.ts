import { VeiculoRepository, OrdemClassificacao } from '../../domain/repositories/VeiculoRepository';
import { VeiculoRepositoryImpl } from '../../infrastructure/repositories/VeiculoRepositoryImpl';
import { StatusVeiculo } from '../../domain/entities/Veiculo';

export interface ConsultarVeiculoInput {
  id: string;
}

export interface FiltrosVeiculo {
  marca?: string;
  modelo?: string;
  anoMin?: number;
  anoMax?: number;
  precoMin?: number;
  precoMax?: number;
  status?: StatusVeiculo;
  ordem?: OrdemClassificacao;
}

export interface ConsultarVeiculoOutput {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
  status: string;
  disponivel: boolean;
  cpfComprador?: string;
  dataVenda?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ConsultarVeiculoUseCase {
  private veiculoRepository: VeiculoRepository;

  constructor() {
    this.veiculoRepository = new VeiculoRepositoryImpl();
  }

  async execute(input: ConsultarVeiculoInput): Promise<ConsultarVeiculoOutput | null> {
    const veiculo = await this.veiculoRepository.buscarPorId(input.id);
    
    if (!veiculo) {
      return null;
    }

    return {
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      cor: veiculo.cor,
      preco: veiculo.preco,
      status: veiculo.status,
      disponivel: veiculo.estaDisponivel(),
      cpfComprador: veiculo.cpfComprador,
      dataVenda: veiculo.dataVenda,
      createdAt: veiculo.createdAt,
      updatedAt: veiculo.updatedAt
    };
  }

  async buscarPorId(id: string): Promise<ConsultarVeiculoOutput | null> {
    return this.execute({ id });
  }

  async listarComFiltros(filtros: FiltrosVeiculo): Promise<ConsultarVeiculoOutput[]> {
    let veiculos;
    
    // Se há status e ordem específicos, usar métodos otimizados
    if (filtros.status && filtros.ordem) {
      if (filtros.status === StatusVeiculo.A_VENDA) {
        veiculos = await this.veiculoRepository.buscarDisponiveis(filtros.ordem);
      } else if (filtros.status === StatusVeiculo.VENDIDO) {
        veiculos = await this.veiculoRepository.buscarVendidos(filtros.ordem);
      } else {
        veiculos = await this.veiculoRepository.buscarPorStatus(filtros.status);
        // Ordenar manualmente se não for A_VENDA ou VENDIDO
        veiculos.sort((a: any, b: any) => {
          return filtros.ordem === 'DESC' ? b.preco - a.preco : a.preco - b.preco;
        });
      }
    } else if (filtros.status) {
      veiculos = await this.veiculoRepository.buscarPorStatus(filtros.status);
      if (filtros.ordem) {
        veiculos.sort((a: any, b: any) => {
          return filtros.ordem === 'DESC' ? b.preco - a.preco : a.preco - b.preco;
        });
      }
    } else if (filtros.ordem) {
      // Se só tem ordem, busca disponíveis por padrão
      veiculos = await this.veiculoRepository.buscarDisponiveis(filtros.ordem);
    } else {
      veiculos = await this.veiculoRepository.buscarTodos();
    }
    
    let veiculosFiltrados = veiculos;

    // Aplicar filtros adicionais
    if (filtros.marca) {
      veiculosFiltrados = veiculosFiltrados.filter((v: any) => 
        v.marca.toLowerCase().includes(filtros.marca!.toLowerCase())
      );
    }

    if (filtros.modelo) {
      veiculosFiltrados = veiculosFiltrados.filter((v: any) => 
        v.modelo.toLowerCase().includes(filtros.modelo!.toLowerCase())
      );
    }

    if (filtros.anoMin) {
      veiculosFiltrados = veiculosFiltrados.filter((v: any) => v.ano >= filtros.anoMin!);
    }

    if (filtros.anoMax) {
      veiculosFiltrados = veiculosFiltrados.filter((v: any) => v.ano <= filtros.anoMax!);
    }

    if (filtros.precoMin) {
      veiculosFiltrados = veiculosFiltrados.filter((v: any) => v.preco >= filtros.precoMin!);
    }

    if (filtros.precoMax) {
      veiculosFiltrados = veiculosFiltrados.filter((v: any) => v.preco <= filtros.precoMax!);
    }

    return veiculosFiltrados.map((veiculo: any) => ({
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      cor: veiculo.cor,
      preco: veiculo.preco,
      status: veiculo.status,
      disponivel: veiculo.estaDisponivel(),
      cpfComprador: veiculo.cpfComprador,
      dataVenda: veiculo.dataVenda,
      createdAt: veiculo.createdAt,
      updatedAt: veiculo.updatedAt
    }));
  }

  async listarDisponiveis(ordem: OrdemClassificacao = 'ASC'): Promise<ConsultarVeiculoOutput[]> {
    const veiculos = await this.veiculoRepository.buscarDisponiveis(ordem);
    
    return veiculos.map((veiculo: any) => ({
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      cor: veiculo.cor,
      preco: veiculo.preco,
      status: veiculo.status,
      disponivel: veiculo.estaDisponivel(),
      cpfComprador: veiculo.cpfComprador,
      dataVenda: veiculo.dataVenda,
      createdAt: veiculo.createdAt,
      updatedAt: veiculo.updatedAt
    }));
  }

  async listarVendidos(ordem: OrdemClassificacao = 'ASC'): Promise<ConsultarVeiculoOutput[]> {
    const veiculos = await this.veiculoRepository.buscarVendidos(ordem);
    
    return veiculos.map((veiculo: any) => ({
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      cor: veiculo.cor,
      preco: veiculo.preco,
      status: veiculo.status,
      disponivel: veiculo.estaDisponivel(),
      cpfComprador: veiculo.cpfComprador,
      dataVenda: veiculo.dataVenda,
      createdAt: veiculo.createdAt,
      updatedAt: veiculo.updatedAt
    }));
  }
}
