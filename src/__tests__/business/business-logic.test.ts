/**
 * Testes unitários para funções auxiliares do projeto
 * Estes testes não dependem dos módulos específicos do projeto
 */

describe('Business Logic Tests', () => {
  describe('Vehicle Status Management', () => {
    const StatusVeiculo = {
      A_VENDA: 'A_VENDA',
      VENDIDO: 'VENDIDO',
      RESERVADO: 'RESERVADO'
    } as const;

    type StatusVeiculo = typeof StatusVeiculo[keyof typeof StatusVeiculo];

    interface Vehicle {
      id: string;
      marca: string;
      modelo: string;
      ano: number;
      status: StatusVeiculo;
      preco: number;
      dataVenda?: Date;
      cpfComprador?: string;
    }

    const isAvailable = (vehicle: Vehicle): boolean => {
      return vehicle.status === StatusVeiculo.A_VENDA;
    };

    const canBeSold = (vehicle: Vehicle): boolean => {
      return vehicle.status !== StatusVeiculo.VENDIDO;
    };

    const calculateTotalValue = (vehicles: Vehicle[]): number => {
      return vehicles
        .filter(v => v.status === StatusVeiculo.A_VENDA)
        .reduce((total, vehicle) => total + vehicle.preco, 0);
    };

    it('deve identificar veículos disponíveis', () => {
      const veiculo: Vehicle = {
        id: 'v1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        status: StatusVeiculo.A_VENDA,
        preco: 85000
      };

      expect(isAvailable(veiculo)).toBe(true);
    });

    it('deve identificar veículos indisponíveis', () => {
      const veiculo: Vehicle = {
        id: 'v1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        status: StatusVeiculo.VENDIDO,
        preco: 85000,
        dataVenda: new Date(),
        cpfComprador: '12345678900'
      };

      expect(isAvailable(veiculo)).toBe(false);
    });

    it('deve verificar se veículo pode ser vendido', () => {
      const veiculoDisponivel: Vehicle = {
        id: 'v1',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        status: StatusVeiculo.A_VENDA,
        preco: 85000
      };

      const veiculoReservado: Vehicle = {
        id: 'v2',
        marca: 'Honda',
        modelo: 'Civic',
        ano: 2023,
        status: StatusVeiculo.RESERVADO,
        preco: 90000
      };

      const veiculoVendido: Vehicle = {
        id: 'v3',
        marca: 'Ford',
        modelo: 'Focus',
        ano: 2023,
        status: StatusVeiculo.VENDIDO,
        preco: 80000
      };

      expect(canBeSold(veiculoDisponivel)).toBe(true);
      expect(canBeSold(veiculoReservado)).toBe(true);
      expect(canBeSold(veiculoVendido)).toBe(false);
    });

    it('deve calcular valor total de veículos disponíveis', () => {
      const veiculos: Vehicle[] = [
        {
          id: 'v1',
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2023,
          status: StatusVeiculo.A_VENDA,
          preco: 85000
        },
        {
          id: 'v2',
          marca: 'Honda',
          modelo: 'Civic',
          ano: 2023,
          status: StatusVeiculo.A_VENDA,
          preco: 90000
        },
        {
          id: 'v3',
          marca: 'Ford',
          modelo: 'Focus',
          ano: 2023,
          status: StatusVeiculo.VENDIDO,
          preco: 80000
        }
      ];

      const total = calculateTotalValue(veiculos);
      expect(total).toBe(175000); // 85000 + 90000 (não inclui o vendido)
    });
  });

  describe('User Role Management', () => {
    const TipoUsuario = {
      ADMIN: 'ADMIN',
      CLIENTE: 'CLIENTE'
    } as const;

    type TipoUsuario = typeof TipoUsuario[keyof typeof TipoUsuario];

    interface User {
      id: string;
      nome: string;
      email: string;
      tipo: TipoUsuario;
      ativo: boolean;
    }

    const canManageVehicles = (user: User): boolean => {
      return user.ativo && user.tipo === TipoUsuario.ADMIN;
    };

    const canPurchaseVehicles = (user: User): boolean => {
      return user.ativo && user.tipo === TipoUsuario.CLIENTE;
    };

    it('deve permitir admin ativo gerenciar veículos', () => {
      const admin: User = {
        id: 'u1',
        nome: 'Admin User',
        email: 'admin@test.com',
        tipo: TipoUsuario.ADMIN,
        ativo: true
      };

      expect(canManageVehicles(admin)).toBe(true);
      expect(canPurchaseVehicles(admin)).toBe(false);
    });

    it('deve permitir cliente ativo comprar veículos', () => {
      const cliente: User = {
        id: 'u2',
        nome: 'Cliente User',
        email: 'cliente@test.com',
        tipo: TipoUsuario.CLIENTE,
        ativo: true
      };

      expect(canManageVehicles(cliente)).toBe(false);
      expect(canPurchaseVehicles(cliente)).toBe(true);
    });

    it('não deve permitir usuário inativo realizar ações', () => {
      const usuarioInativo: User = {
        id: 'u3',
        nome: 'Inativo User',
        email: 'inativo@test.com',
        tipo: TipoUsuario.ADMIN,
        ativo: false
      };

      expect(canManageVehicles(usuarioInativo)).toBe(false);
      expect(canPurchaseVehicles(usuarioInativo)).toBe(false);
    });
  });

  describe('Price Calculations', () => {
    const calculateDiscount = (originalPrice: number, discountPercent: number): number => {
      return originalPrice * (1 - discountPercent / 100);
    };

    const calculateInstallments = (totalPrice: number, months: number): number => {
      return Math.round((totalPrice / months) * 100) / 100;
    };

    const calculateTax = (price: number, taxRate: number = 0.1): number => {
      return Math.round((price * taxRate) * 100) / 100;
    };

    it('deve calcular desconto corretamente', () => {
      expect(calculateDiscount(100000, 10)).toBe(90000);
      expect(calculateDiscount(85000, 5)).toBe(80750);
    });

    it('deve calcular parcelas mensais', () => {
      expect(calculateInstallments(60000, 12)).toBe(5000);
      expect(calculateInstallments(85000, 24)).toBe(3541.67);
    });

    it('deve calcular impostos', () => {
      expect(calculateTax(100000)).toBe(10000);
      expect(calculateTax(85000, 0.15)).toBe(12750);
    });
  });

  describe('Search and Filter Logic', () => {
    interface VehicleSearchCriteria {
      marca?: string;
      anoMin?: number;
      anoMax?: number;
      precoMin?: number;
      precoMax?: number;
      status?: string;
    }

    interface Vehicle {
      id: string;
      marca: string;
      modelo: string;
      ano: number;
      preco: number;
      status: string;
    }

    const filterVehicles = (vehicles: Vehicle[], criteria: VehicleSearchCriteria): Vehicle[] => {
      return vehicles.filter(vehicle => {
        if (criteria.marca && vehicle.marca.toLowerCase() !== criteria.marca.toLowerCase()) {
          return false;
        }
        if (criteria.anoMin && vehicle.ano < criteria.anoMin) {
          return false;
        }
        if (criteria.anoMax && vehicle.ano > criteria.anoMax) {
          return false;
        }
        if (criteria.precoMin && vehicle.preco < criteria.precoMin) {
          return false;
        }
        if (criteria.precoMax && vehicle.preco > criteria.precoMax) {
          return false;
        }
        if (criteria.status && vehicle.status !== criteria.status) {
          return false;
        }
        return true;
      });
    };

    const vehicles: Vehicle[] = [
      { id: 'v1', marca: 'Toyota', modelo: 'Corolla', ano: 2020, preco: 75000, status: 'A_VENDA' },
      { id: 'v2', marca: 'Toyota', modelo: 'Camry', ano: 2022, preco: 95000, status: 'A_VENDA' },
      { id: 'v3', marca: 'Honda', modelo: 'Civic', ano: 2021, preco: 85000, status: 'VENDIDO' },
      { id: 'v4', marca: 'Honda', modelo: 'Accord', ano: 2023, preco: 105000, status: 'A_VENDA' }
    ];

    it('deve filtrar por marca', () => {
      const result = filterVehicles(vehicles, { marca: 'Toyota' });
      expect(result).toHaveLength(2);
      expect(result.every(v => v.marca === 'Toyota')).toBe(true);
    });

    it('deve filtrar por faixa de ano', () => {
      const result = filterVehicles(vehicles, { anoMin: 2021, anoMax: 2022 });
      expect(result).toHaveLength(2);
      expect(result.every(v => v.ano >= 2021 && v.ano <= 2022)).toBe(true);
    });

    it('deve filtrar por faixa de preço', () => {
      const result = filterVehicles(vehicles, { precoMin: 80000, precoMax: 100000 });
      expect(result).toHaveLength(2);
      expect(result.every(v => v.preco >= 80000 && v.preco <= 100000)).toBe(true);
    });

    it('deve filtrar por status', () => {
      const result = filterVehicles(vehicles, { status: 'A_VENDA' });
      expect(result).toHaveLength(3);
      expect(result.every(v => v.status === 'A_VENDA')).toBe(true);
    });

    it('deve aplicar múltiplos filtros', () => {
      const result = filterVehicles(vehicles, { 
        marca: 'Honda', 
        status: 'A_VENDA',
        anoMin: 2023
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('v4');
    });
  });

  describe('Date and Time Utilities', () => {
    const isBusinessDay = (date: Date): boolean => {
      const day = date.getDay();
      return day >= 1 && day <= 5; // Segunda a Sexta
    };

    const addBusinessDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      let addedDays = 0;
      
      while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        if (isBusinessDay(result)) {
          addedDays++;
        }
      }
      
      return result;
    };

    const calculateAge = (birthDate: Date): number => {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    };

    it('deve identificar dias úteis', () => {
      // Usando datas específicas onde sabemos o dia da semana
      const segunda = new Date(2023, 5, 12); // 12 de junho de 2023 - Segunda
      const terca = new Date(2023, 5, 13); // 13 de junho de 2023 - Terça
      const sabado = new Date(2023, 5, 10); // 10 de junho de 2023 - Sábado
      const domingo = new Date(2023, 5, 11); // 11 de junho de 2023 - Domingo

      expect(isBusinessDay(segunda)).toBe(true);
      expect(isBusinessDay(terca)).toBe(true);
      expect(isBusinessDay(sabado)).toBe(false);
      expect(isBusinessDay(domingo)).toBe(false);
    });

    it('deve adicionar dias úteis corretamente', () => {
      // Sexta-feira, 9 de junho de 2023
      const sexta = new Date(2023, 5, 9);
      const proximaSegunda = addBusinessDays(sexta, 1);
      
      // Deve pular o fim de semana e ir para segunda, 12 de junho
      expect(proximaSegunda.getDay()).toBe(1); // Segunda-feira
      expect(proximaSegunda.getDate()).toBe(12);
    });

    it('deve calcular idade corretamente', () => {
      // Usando data fixa para o teste ser determinístico
      const nascimento = new Date('1990-01-01');
      const hoje = new Date('2023-06-15');
      
      // Sobrescrever Date para o teste
      const originalDate = Date;
      global.Date = jest.fn(() => hoje) as any;
      global.Date.now = originalDate.now;
      
      const idade = calculateAge(nascimento);
      
      // Restaurar Date original
      global.Date = originalDate;
      
      expect(idade).toBe(33);
    });
  });
});
