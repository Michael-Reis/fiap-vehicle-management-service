import { CadastrarVeiculoUseCase, CadastrarVeiculoInput } from '../../../application/usecases/CadastrarVeiculoUseCase';
import { VeiculoRepository } from '../../../domain/repositories/VeiculoRepository';
import { Veiculo, StatusVeiculo } from '../../../domain/entities/Veiculo';

// Mock do repository
class MockVeiculoRepository implements VeiculoRepository {
  private veiculos: Veiculo[] = [];

  async salvar(veiculo: Veiculo): Promise<Veiculo> {
    this.veiculos.push(veiculo);
    return veiculo;
  }

  async buscarPorId(id: string): Promise<Veiculo | null> {
    return this.veiculos.find(v => v.id === id) || null;
  }

  async buscarTodos(): Promise<Veiculo[]> {
    return this.veiculos;
  }

  async atualizar(id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> {
    const index = this.veiculos.findIndex(v => v.id === id);
    if (index >= 0) {
      Object.assign(this.veiculos[index], veiculo);
      return this.veiculos[index];
    }
    throw new Error('Veículo não encontrado');
  }

  async deletar(id: string): Promise<void> {
    const index = this.veiculos.findIndex(v => v.id === id);
    if (index >= 0) {
      this.veiculos.splice(index, 1);
    }
  }

  async buscarPorMarcaEModelo(marca: string, modelo: string): Promise<Veiculo[]> {
    return this.veiculos.filter(v => v.marca === marca && v.modelo === modelo);
  }

  async buscarPorFaixaPreco(precoMin: number, precoMax: number): Promise<Veiculo[]> {
    return this.veiculos.filter(v => v.preco >= precoMin && v.preco <= precoMax);
  }

  async buscarPorStatus(status: any): Promise<Veiculo[]> {
    return this.veiculos.filter(v => v.status === status);
  }

  async buscarDisponiveis(ordem?: any): Promise<Veiculo[]> {
    const disponiveis = this.veiculos.filter(v => v.estaDisponivel());
    if (ordem === 'DESC') {
      return disponiveis.sort((a, b) => b.preco - a.preco);
    }
    return disponiveis.sort((a, b) => a.preco - b.preco);
  }

  async buscarVendidos(ordem?: any): Promise<Veiculo[]> {
    const vendidos = this.veiculos.filter(v => !v.estaDisponivel());
    if (ordem === 'DESC') {
      return vendidos.sort((a, b) => b.preco - a.preco);
    }
    return vendidos.sort((a, b) => a.preco - b.preco);
  }

  async existePorId(id: string): Promise<boolean> {
    return this.veiculos.some(v => v.id === id);
  }
}

describe('CadastrarVeiculoUseCase', () => {
  let useCase: CadastrarVeiculoUseCase;
  let mockRepository: MockVeiculoRepository;

  beforeEach(() => {
    mockRepository = new MockVeiculoRepository();
    useCase = new CadastrarVeiculoUseCase();
    // Injetar o mock repository
    (useCase as any).veiculoRepository = mockRepository;
  });

  const validInput: CadastrarVeiculoInput = {
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2023,
    cor: 'Branco',
    preco: 85000
  };

  describe('Execução bem-sucedida', () => {
    it('deve cadastrar um veículo com dados válidos', async () => {
      const result = await useCase.execute(validInput);

      expect(result).toEqual({
        id: expect.any(String),
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: StatusVeiculo.A_VENDA,
        createdAt: expect.any(Date)
      });
    });

    it('deve remover espaços em branco dos campos de texto', async () => {
      const inputComEspacos: CadastrarVeiculoInput = {
        marca: '  Toyota  ',
        modelo: '  Corolla  ',
        ano: 2023,
        cor: '  Branco  ',
        preco: 85000
      };

      const result = await useCase.execute(inputComEspacos);

      expect(result.marca).toBe('Toyota');
      expect(result.modelo).toBe('Corolla');
      expect(result.cor).toBe('Branco');
    });

    it('deve definir status como A_VENDA por padrão', async () => {
      const result = await useCase.execute(validInput);
      expect(result.status).toBe(StatusVeiculo.A_VENDA);
    });

    it('deve definir data de criação', async () => {
      const result = await useCase.execute(validInput);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('deve gerar um ID único para o veículo', async () => {
      const result1 = await useCase.execute(validInput);
      const result2 = await useCase.execute(validInput);
      
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    it('deve aceitar descrição opcional', async () => {
      const inputComDescricao: CadastrarVeiculoInput = {
        ...validInput,
        descricao: 'Veículo em excelente estado'
      };

      const result = await useCase.execute(inputComDescricao);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('deve retornar todos os campos obrigatórios', async () => {
      const result = await useCase.execute(validInput);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('marca');
      expect(result).toHaveProperty('modelo');
      expect(result).toHaveProperty('ano');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('preco');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('Diferentes tipos de veículos', () => {
    it('deve cadastrar um Honda Civic', async () => {
      const hondaInput: CadastrarVeiculoInput = {
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2022,
        cor: 'Preto',
        preco: 95000
      };

      const result = await useCase.execute(hondaInput);
      
      expect(result.marca).toBe('Honda');
      expect(result.modelo).toBe('Civic');
      expect(result.preco).toBe(95000);
    });

    it('deve cadastrar um Volkswagen Gol', async () => {
      const vwInput: CadastrarVeiculoInput = {
        marca: 'Volkswagen',
        modelo: 'Gol',
        ano: 2021,
        cor: 'Azul',
        preco: 55000
      };

      const result = await useCase.execute(vwInput);
      
      expect(result.marca).toBe('Volkswagen');
      expect(result.modelo).toBe('Gol');
      expect(result.ano).toBe(2021);
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com preços decimais', async () => {
      const inputPrecoDecimal: CadastrarVeiculoInput = {
        ...validInput,
        preco: 85999.99
      };

      const result = await useCase.execute(inputPrecoDecimal);
      expect(result.preco).toBe(85999.99);
    });

    it('deve lidar com nomes de marca e modelo longos', async () => {
      const inputNomesLongos: CadastrarVeiculoInput = {
        marca: 'Mercedes-Benz',
        modelo: 'Classe A 200 Style 1.3 Turbo Flex Aut.',
        ano: 2023,
        cor: 'Prata Metalico',
        preco: 180000
      };

      const result = await useCase.execute(inputNomesLongos);
      expect(result.marca).toBe('Mercedes-Benz');
      expect(result.modelo).toBe('Classe A 200 Style 1.3 Turbo Flex Aut.');
    });
  });
});
