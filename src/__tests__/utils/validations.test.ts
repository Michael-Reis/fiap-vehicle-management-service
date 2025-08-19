/**
 * Testes de utilidades e validações gerais
 */

describe('CPF Validation', () => {
  // Função helper para validar CPF (simulando uma função utilitária)
  const validarCPF = (cpf: string): boolean => {
    if (!cpf) return false;
    
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCPF.charAt(10));
  };

  describe('CPFs válidos', () => {
    it('deve validar CPFs conhecidos como válidos', () => {
      const cpfsValidos = [
        '11144477735',
        '12345678909',
        '98765432100'
      ];

      cpfsValidos.forEach(cpf => {
        expect(validarCPF(cpf)).toBe(true);
      });
    });

    it('deve validar CPF com formatação', () => {
      expect(validarCPF('111.444.777-35')).toBe(true);
      expect(validarCPF('123.456.789-09')).toBe(true);
    });
  });

  describe('CPFs inválidos', () => {
    it('deve invalidar CPFs com todos os dígitos iguais', () => {
      const cpfsInvalidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '99999999999'
      ];

      cpfsInvalidos.forEach(cpf => {
        expect(validarCPF(cpf)).toBe(false);
      });
    });

    it('deve invalidar CPFs com tamanho incorreto', () => {
      expect(validarCPF('123')).toBe(false);
      expect(validarCPF('123456789012')).toBe(false);
      expect(validarCPF('')).toBe(false);
    });

    it('deve invalidar CPFs com dígitos verificadores incorretos', () => {
      expect(validarCPF('12345678900')).toBe(false);
      expect(validarCPF('11144477736')).toBe(false);
    });
  });
});

describe('Email Validation', () => {
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  describe('Emails válidos', () => {
    it('deve validar emails com formato correto', () => {
      const emailsValidos = [
        'usuario@email.com',
        'teste.usuario@empresa.com.br',
        'admin+test@sistema.org',
        'user123@dominio-teste.co.uk'
      ];

      emailsValidos.forEach(email => {
        expect(validarEmail(email)).toBe(true);
      });
    });
  });

  describe('Emails inválidos', () => {
    it('deve invalidar emails com formato incorreto', () => {
      const emailsInvalidos = [
        'email-sem-arroba.com',
        '@dominio.com',
        'usuario@',
        'usuario@@duplo.com',
        'espaço@no email.com',
        'sem-dominio@'
      ];

      emailsInvalidos.forEach(email => {
        expect(validarEmail(email)).toBe(false);
      });
    });
  });
});

describe('Password Validation', () => {
  const validarSenha = (senha: string): { valida: boolean; erros: string[] } => {
    const erros: string[] = [];
    
    if (!senha || senha.length < 6) {
      erros.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (!/[A-Z]/.test(senha)) {
      erros.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(senha)) {
      erros.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(senha)) {
      erros.push('Senha deve conter pelo menos um número');
    }
    
    return {
      valida: erros.length === 0,
      erros
    };
  };

  describe('Senhas válidas', () => {
    it('deve validar senhas que atendem todos os critérios', () => {
      const senhasValidas = [
        'MinhaSenh@123',
        'PassWord1',
        'Teste123',
        'Admin2023'
      ];

      senhasValidas.forEach(senha => {
        const resultado = validarSenha(senha);
        expect(resultado.valida).toBe(true);
        expect(resultado.erros).toHaveLength(0);
      });
    });
  });

  describe('Senhas inválidas', () => {
    it('deve invalidar senha muito curta', () => {
      const resultado = validarSenha('12345');
      
      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve invalidar senha sem maiúscula', () => {
      const resultado = validarSenha('senha123');
      
      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Senha deve conter pelo menos uma letra maiúscula');
    });

    it('deve invalidar senha sem minúscula', () => {
      const resultado = validarSenha('SENHA123');
      
      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Senha deve conter pelo menos uma letra minúscula');
    });

    it('deve invalidar senha sem número', () => {
      const resultado = validarSenha('SenhaTexto');
      
      expect(resultado.valida).toBe(false);
      expect(resultado.erros).toContain('Senha deve conter pelo menos um número');
    });
  });
});

describe('Date Utilities', () => {
  const formatarData = (data: Date): string => {
    return data.toISOString().split('T')[0];
  };

  const adicionarDias = (data: Date, dias: number): Date => {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  };

  it('deve formatar data corretamente', () => {
    const data = new Date('2023-06-15T10:30:00.000Z');
    expect(formatarData(data)).toBe('2023-06-15');
  });

  it('deve adicionar dias à data', () => {
    const dataInicial = new Date('2023-06-15');
    const dataFinal = adicionarDias(dataInicial, 7);
    
    expect(formatarData(dataFinal)).toBe('2023-06-22');
  });

  it('deve subtrair dias da data', () => {
    const dataInicial = new Date('2023-06-15');
    const dataFinal = adicionarDias(dataInicial, -7);
    
    expect(formatarData(dataFinal)).toBe('2023-06-08');
  });
});

describe('Money Utilities', () => {
  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const parsearMoeda = (valor: string): number => {
    return parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.'));
  };

  it('deve formatar número como moeda brasileira', () => {
    const resultado1 = formatarMoeda(85000);
    const resultado2 = formatarMoeda(1500.50);
    
    expect(resultado1).toMatch(/R\$\s*85\.000,00/);
    expect(resultado2).toMatch(/R\$\s*1\.500,50/);
  });

  it('deve parsear string de moeda para número', () => {
    expect(parsearMoeda('R$ 85.000,00')).toBe(85000);
    expect(parsearMoeda('R$ 1.500,50')).toBe(1500.50);
  });
});

describe('String Utilities', () => {
  const removerAcentos = (texto: string): string => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const capitalizar = (texto: string): string => {
    return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  it('deve remover acentos do texto', () => {
    expect(removerAcentos('Olá, como está?')).toBe('Ola, como esta?');
    expect(removerAcentos('São Paulo')).toBe('Sao Paulo');
  });

  it('deve capitalizar texto', () => {
    expect(capitalizar('toyota corolla')).toBe('Toyota Corolla');
    expect(capitalizar('HONDA CIVIC')).toBe('Honda Civic');
  });
});

describe('Array Utilities', () => {
  const removerDuplicados = <T>(array: T[]): T[] => {
    return [...new Set(array)];
  };

  const agruparPor = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((grupos, item) => {
      const valor = String(item[key]);
      grupos[valor] = grupos[valor] || [];
      grupos[valor].push(item);
      return grupos;
    }, {} as Record<string, T[]>);
  };

  it('deve remover elementos duplicados', () => {
    const numeros = [1, 2, 2, 3, 3, 3, 4];
    expect(removerDuplicados(numeros)).toEqual([1, 2, 3, 4]);

    const strings = ['a', 'b', 'a', 'c', 'b'];
    expect(removerDuplicados(strings)).toEqual(['a', 'b', 'c']);
  });

  it('deve agrupar elementos por propriedade', () => {
    const veiculos = [
      { marca: 'Toyota', modelo: 'Corolla' },
      { marca: 'Toyota', modelo: 'Camry' },
      { marca: 'Honda', modelo: 'Civic' }
    ];

    const agrupados = agruparPor(veiculos, 'marca');

    expect(agrupados['Toyota']).toHaveLength(2);
    expect(agrupados['Honda']).toHaveLength(1);
  });
});
