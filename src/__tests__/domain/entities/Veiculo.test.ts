import { Veiculo, VeiculoProps, StatusVeiculo } from '../../../domain/entities/Veiculo';

describe('Veiculo Entity', () => {
  const validVeiculoProps: VeiculoProps = {
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2023,
    cor: 'Branco',
    preco: 85000,
    status: StatusVeiculo.A_VENDA
  };

  describe('Criação de veículo', () => {
    it('deve criar um veículo válido com propriedades básicas', () => {
      const veiculo = new Veiculo(validVeiculoProps);

      expect(veiculo.id).toBeDefined();
      expect(veiculo.marca).toBe('Toyota');
      expect(veiculo.modelo).toBe('Corolla');
      expect(veiculo.ano).toBe(2023);
      expect(veiculo.cor).toBe('Branco');
      expect(veiculo.preco).toBe(85000);
      expect(veiculo.status).toBe(StatusVeiculo.A_VENDA);
      expect(veiculo.createdAt).toBeDefined();
      expect(veiculo.updatedAt).toBeDefined();
    });

    it('deve gerar um ID único se não fornecido', () => {
      const veiculo1 = new Veiculo(validVeiculoProps);
      const veiculo2 = new Veiculo(validVeiculoProps);

      expect(veiculo1.id).toBeDefined();
      expect(veiculo2.id).toBeDefined();
      expect(veiculo1.id).not.toBe(veiculo2.id);
    });

    it('deve usar o ID fornecido se especificado', () => {
      const customId = 'veh_custom_123';
      const veiculo = new Veiculo({ ...validVeiculoProps, id: customId });

      expect(veiculo.id).toBe(customId);
    });

    it('deve criar veículo com dados de venda quando vendido', () => {
      const dataVenda = new Date();
      const veiculoVendido: VeiculoProps = {
        ...validVeiculoProps,
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '11144477735', // CPF válido
        dataVenda,
        codigoPagamento: 'PAG123456'
      };

      const veiculo = new Veiculo(veiculoVendido);

      expect(veiculo.status).toBe(StatusVeiculo.VENDIDO);
      expect(veiculo.cpfComprador).toBe('11144477735');
      expect(veiculo.dataVenda).toBe(dataVenda);
      expect(veiculo.codigoPagamento).toBe('PAG123456');
    });
  });

  describe('Validações', () => {
    it('deve lançar erro para marca vazia', () => {
      expect(() => {
        new Veiculo({ ...validVeiculoProps, marca: '' });
      }).toThrow('Marca é obrigatória');
    });

    it('deve lançar erro para modelo vazio', () => {
      expect(() => {
        new Veiculo({ ...validVeiculoProps, modelo: '' });
      }).toThrow('Modelo é obrigatório');
    });

    it('deve lançar erro para ano muito antigo', () => {
      expect(() => {
        new Veiculo({ ...validVeiculoProps, ano: 1899 });
      }).toThrow('Ano deve estar entre 1900 e 2026');
    });

    it('deve lançar erro para ano muito futuro', () => {
      const anoFuturo = new Date().getFullYear() + 2;
      expect(() => {
        new Veiculo({ ...validVeiculoProps, ano: anoFuturo });
      }).toThrow('Ano deve estar entre 1900 e 2026');
    });

    it('deve lançar erro para preço negativo', () => {
      expect(() => {
        new Veiculo({ ...validVeiculoProps, preco: -1000 });
      }).toThrow('Preço deve ser maior que zero');
    });

    it('deve lançar erro para preço zero', () => {
      expect(() => {
        new Veiculo({ ...validVeiculoProps, preco: 0 });
      }).toThrow('Preço deve ser maior que zero');
    });

    it('deve lançar erro para cor vazia', () => {
      expect(() => {
        new Veiculo({ ...validVeiculoProps, cor: '' });
      }).toThrow('Cor é obrigatória');
    });
  });

  describe('Operações de venda', () => {
    it('deve marcar veículo como vendido', () => {
      const veiculo = new Veiculo(validVeiculoProps);
      const cpfComprador = '11144477735'; // CPF válido
      const codigoPagamento = 'PAG123456';

      veiculo.marcarComoVendido(cpfComprador, codigoPagamento);

      expect(veiculo.status).toBe(StatusVeiculo.VENDIDO);
      expect(veiculo.cpfComprador).toBe(cpfComprador);
      expect(veiculo.codigoPagamento).toBe(codigoPagamento);
      expect(veiculo.dataVenda).toBeDefined();
    });

    it('deve marcar veículo como reservado', () => {
      const veiculo = new Veiculo(validVeiculoProps);
      const cpfComprador = '11144477735'; // CPF válido
      const codigoPagamento = 'PAG123';

      veiculo.marcarComoReservado(cpfComprador, codigoPagamento);

      expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);
      expect(veiculo.cpfComprador).toBe(cpfComprador);
    });

    it('deve cancelar reserva', () => {
      const veiculo = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.RESERVADO,
        cpfComprador: '11144477735' // CPF válido
      });

      veiculo.voltarParaVenda();

      expect(veiculo.status).toBe(StatusVeiculo.A_VENDA);
      expect(veiculo.cpfComprador).toBeUndefined();
    });

    it('deve lançar erro ao tentar vender veículo já vendido', () => {
      const veiculo = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.VENDIDO
      });

      expect(() => {
        veiculo.marcarComoVendido('11144477735', 'PAG123');
      }).toThrow('Veículo já foi vendido');
    });
  });

  describe('Métodos utilitários', () => {
    it('deve verificar se está disponível para venda', () => {
      const veiculoDisponivel = new Veiculo(validVeiculoProps);
      const veiculoVendido = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.VENDIDO
      });
      const veiculoReservado = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.RESERVADO
      });

      expect(veiculoDisponivel.estaDisponivel()).toBe(true);
      expect(veiculoVendido.estaDisponivel()).toBe(false);
      expect(veiculoReservado.estaDisponivel()).toBe(false);
    });

    it('deve verificar se foi vendido', () => {
      const veiculoVendido = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.VENDIDO
      });
      const veiculoDisponivel = new Veiculo(validVeiculoProps);

      expect(veiculoVendido.status).toBe(StatusVeiculo.VENDIDO);
      expect(veiculoDisponivel.status).toBe(StatusVeiculo.A_VENDA);
    });

    it('deve verificar se está reservado', () => {
      const veiculoReservado = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.RESERVADO
      });
      const veiculoDisponivel = new Veiculo(validVeiculoProps);

      expect(veiculoReservado.status).toBe(StatusVeiculo.RESERVADO);
      expect(veiculoDisponivel.status).toBe(StatusVeiculo.A_VENDA);
    });
  });

  describe('Atualização de dados', () => {
    it('deve atualizar preço', () => {
      const veiculo = new Veiculo(validVeiculoProps);
      const novoPreco = 90000;

      veiculo.atualizarDados({ preco: novoPreco });

      expect(veiculo.preco).toBe(novoPreco);
    });

    it('deve lançar erro ao atualizar preço para valor inválido', () => {
      const veiculo = new Veiculo(validVeiculoProps);

      expect(() => {
        veiculo.atualizarDados({ preco: -1000 });
      }).toThrow('Preço deve ser maior que zero');
    });

    it('deve atualizar cor', () => {
      const veiculo = new Veiculo(validVeiculoProps);
      const novaCor = 'Azul';

      veiculo.atualizarDados({ cor: novaCor });

      expect(veiculo.cor).toBe(novaCor);
    });
  });

  describe('Serialização', () => {
    it('deve retornar objeto JSON com todas as propriedades', () => {
      const veiculo = new Veiculo(validVeiculoProps);
      const obj = veiculo.toJSON();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('marca');
      expect(obj).toHaveProperty('modelo');
      expect(obj).toHaveProperty('ano');
      expect(obj).toHaveProperty('cor');
      expect(obj).toHaveProperty('preco');
      expect(obj).toHaveProperty('status');
      expect(obj).toHaveProperty('createdAt');
      expect(obj).toHaveProperty('updatedAt');
    });

    it('deve incluir dados de venda quando aplicável', () => {
      const veiculo = new Veiculo({
        ...validVeiculoProps,
        status: StatusVeiculo.VENDIDO,
        cpfComprador: '11144477735', // CPF válido
        dataVenda: new Date(),
        codigoPagamento: 'PAG123'
      });
      const obj = veiculo.toJSON();

      expect(obj.cpfComprador).toBe('11144477735');
      expect(obj.dataVenda).toBeDefined();
      expect(obj.codigoPagamento).toBe('PAG123');
    });
  });
});
