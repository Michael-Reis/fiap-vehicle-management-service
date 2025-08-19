import { Veiculo, StatusVeiculo, VeiculoProps } from '../../../domain/entities/Veiculo';

describe('Veiculo - Testes de Cobertura', () => {
  test('deve criar um veículo válido', () => {
    const props: VeiculoProps = {
      id: 'VH001',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(props);

    expect(veiculo.id).toBe('VH001');
    expect(veiculo.marca).toBe('Toyota');
    expect(veiculo.modelo).toBe('Corolla');
    expect(veiculo.ano).toBe(2022);
    expect(veiculo.cor).toBe('Prata');
    expect(veiculo.preco).toBe(50000);
    expect(veiculo.status).toBe(StatusVeiculo.A_VENDA);
  });

  test('deve gerar ID automaticamente quando não fornecido', () => {
    const props: VeiculoProps = {
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2021,
      cor: 'Azul',
      preco: 45000,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(props);

    expect(veiculo.id).toBeDefined();
    expect(typeof veiculo.id).toBe('string');
    expect(veiculo.id.length).toBeGreaterThan(0);
  });

  test('deve permitir marcar como vendido', () => {
    const props: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(props);

    veiculo.marcarComoVendido('11144477735', 'PAY123'); // CPF válido

    expect(veiculo.status).toBe(StatusVeiculo.VENDIDO);
    expect(veiculo.cpfComprador).toBe('11144477735');
    expect(veiculo.codigoPagamento).toBe('PAY123');
    expect(veiculo.dataVenda).toBeInstanceOf(Date);
  });

  test('deve permitir marcar como reservado', () => {
    const props: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(props);

    veiculo.marcarComoReservado('11144477735', 'RES123'); // CPF válido

    expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);
    expect(veiculo.cpfComprador).toBe('11144477735');
    expect(veiculo.codigoPagamento).toBe('RES123');
  });

  test('deve permitir voltar para venda', () => {
    const props: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.RESERVADO,
      cpfComprador: '11144477735' // CPF válido
    };

    const veiculo = new Veiculo(props);

    veiculo.voltarParaVenda();

    expect(veiculo.status).toBe(StatusVeiculo.A_VENDA);
    expect(veiculo.cpfComprador).toBeUndefined();
    expect(veiculo.dataVenda).toBeUndefined();
    expect(veiculo.codigoPagamento).toBeUndefined();
  });

  test('deve atualizar dados corretamente', () => {
    const props: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(props);

    veiculo.atualizarDados({
      preco: 55000,
      cor: 'Azul'
    });

    expect(veiculo.preco).toBe(55000);
    expect(veiculo.cor).toBe('Azul');
  });

  test('deve verificar se está disponível', () => {
    const propsDisponivel: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.A_VENDA
    };

    const propsVendido: VeiculoProps = {
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2021,
      cor: 'Azul',
      preco: 45000,
      status: StatusVeiculo.VENDIDO
    };

    const veiculoDisponivel = new Veiculo(propsDisponivel);
    const veiculoVendido = new Veiculo(propsVendido);

    expect(veiculoDisponivel.estaDisponivel()).toBe(true);
    expect(veiculoVendido.estaDisponivel()).toBe(false);
  });

  test('deve validar campos obrigatórios', () => {
    expect(() => {
      new Veiculo({
        marca: '',
        modelo: 'Corolla',
        ano: 2022,
        cor: 'Prata',
        preco: 50000,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow('Marca é obrigatória');

    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: '',
        ano: 2022,
        cor: 'Prata',
        preco: 50000,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow('Modelo é obrigatório');

    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2022,
        cor: '',
        preco: 50000,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow('Cor é obrigatória');
  });

  test('deve validar ano do veículo', () => {
    const anoAtual = new Date().getFullYear();
    
    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 1899,
        cor: 'Prata',
        preco: 50000,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow(`Ano deve estar entre 1900 e ${anoAtual + 1}`);

    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: anoAtual + 3,
        cor: 'Prata',
        preco: 50000,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow(`Ano deve estar entre 1900 e ${anoAtual + 1}`);
  });

  test('deve validar preço positivo', () => {
    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2022,
        cor: 'Prata',
        preco: -1000,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow('Preço deve ser maior que zero');

    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2022,
        cor: 'Prata',
        preco: 0,
        status: StatusVeiculo.A_VENDA
      });
    }).toThrow('Preço deve ser maior que zero');
  });

  test('deve validar CPF quando fornecido', () => {
    expect(() => {
      new Veiculo({
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2022,
        cor: 'Prata',
        preco: 50000,
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '123.456.789-10' // CPF inválido
      });
    }).toThrow('CPF inválido');
  });

  test('deve permitir pular validação', () => {
    expect(() => {
      new Veiculo({
        marca: '',
        modelo: '',
        ano: 1800,
        cor: '',
        preco: -1000,
        status: StatusVeiculo.A_VENDA
      }, true); // skipValidation = true
    }).not.toThrow();
  });

  test('deve lançar erro ao tentar vender veículo já vendido', () => {
    const props: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.VENDIDO
    };

    const veiculo = new Veiculo(props);

    expect(() => {
      veiculo.marcarComoVendido('11144477735', 'PAY456');
    }).toThrow('Veículo já foi vendido');
  });

  test('deve lançar erro ao tentar reservar veículo não disponível', () => {
    const props: VeiculoProps = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.VENDIDO
    };

    const veiculo = new Veiculo(props);

    expect(() => {
      veiculo.marcarComoReservado('11144477735', 'RES456');
    }).toThrow('Veículo não está disponível para reserva');
  });

  test('deve converter para JSON corretamente', () => {
    const props: VeiculoProps = {
      id: 'VH001',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2022,
      cor: 'Prata',
      preco: 50000,
      status: StatusVeiculo.A_VENDA
    };

    const veiculo = new Veiculo(props);
    const json = veiculo.toJSON();

    expect(json).toHaveProperty('id', 'VH001');
    expect(json).toHaveProperty('marca', 'Toyota');
    expect(json).toHaveProperty('modelo', 'Corolla');
    expect(json).toHaveProperty('ano', 2022);
    expect(json).toHaveProperty('cor', 'Prata');
    expect(json).toHaveProperty('preco', 50000);
    expect(json).toHaveProperty('status', StatusVeiculo.A_VENDA);
  });
});
