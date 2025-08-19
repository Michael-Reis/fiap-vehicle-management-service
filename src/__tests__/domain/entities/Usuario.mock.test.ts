import { describe, it, expect } from '@jest/globals';

/**
 * Testes simulados da entidade Usuario
 * Estes testes validam a lógica que será implementada na entidade real
 */

enum TipoUsuario {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE'
}

interface UsuarioProps {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  ativo: boolean;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Simulação da classe Usuario
class MockUsuario {
  private readonly _id: string;
  private _nome: string;
  private _email: string;
  private _senha: string;
  private _tipo: TipoUsuario;
  private _ativo: boolean;
  private _cpf?: string;
  private _telefone?: string;
  private _endereco?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UsuarioProps) {
    this._id = props.id || this.generateId();
    this._nome = props.nome;
    this._email = props.email;
    this._senha = props.senha;
    this._tipo = props.tipo;
    this._ativo = props.ativo;
    this._cpf = props.cpf;
    this._telefone = props.telefone;
    this._endereco = props.endereco;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private generateId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this._nome || this._nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (!this._email || !this.isValidEmail(this._email)) {
      throw new Error('Email deve ter um formato válido');
    }

    if (!this._senha || this._senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (this._cpf && !this.isValidCPF(this._cpf)) {
      throw new Error('CPF deve ter 11 dígitos');
    }

    if (this._telefone && !this.isValidTelefone(this._telefone)) {
      throw new Error('Telefone deve ter entre 10 e 11 dígitos');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return cleanCPF.length === 11 && !(/^(\d)\1{10}$/.test(cleanCPF));
  }

  private isValidTelefone(telefone: string): boolean {
    const cleanTelefone = telefone.replace(/[^\d]/g, '');
    return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
  }

  // Getters
  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get email(): string { return this._email; }
  get tipo(): TipoUsuario { return this._tipo; }
  get ativo(): boolean { return this._ativo; }
  get cpf(): string | undefined { return this._cpf; }
  get telefone(): string | undefined { return this._telefone; }
  get endereco(): string | undefined { return this._endereco; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos utilitários
  ehAdmin(): boolean {
    return this._tipo === TipoUsuario.ADMIN;
  }

  ehCliente(): boolean {
    return this._tipo === TipoUsuario.CLIENTE;
  }

  podeGerenciarVeiculos(): boolean {
    return this._ativo && this.ehAdmin();
  }

  toJSON(): UsuarioProps {
    return {
      id: this._id,
      nome: this._nome,
      email: this._email,
      senha: this._senha,
      tipo: this._tipo,
      ativo: this._ativo,
      cpf: this._cpf,
      telefone: this._telefone,
      endereco: this._endereco,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  toSafeJSON(): Omit<UsuarioProps, 'senha'> {
    return {
      id: this._id,
      nome: this._nome,
      email: this._email,
      tipo: this._tipo,
      ativo: this._ativo,
      cpf: this._cpf,
      telefone: this._telefone,
      endereco: this._endereco,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}

describe('Usuario Entity (Mock)', () => {
  const validUsuarioProps: UsuarioProps = {
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'senhaSegura123',
    tipo: TipoUsuario.CLIENTE,
    ativo: true,
    cpf: '12345678900',
    telefone: '11999999999',
    endereco: 'Rua das Flores, 123'
  };

  describe('Criação de usuário', () => {
    it('deve criar um usuário válido com todos os campos', () => {
      const usuario = new MockUsuario(validUsuarioProps);

      expect(usuario.id).toBeDefined();
      expect(usuario.nome).toBe('João Silva');
      expect(usuario.email).toBe('joao@email.com');
      expect(usuario.tipo).toBe(TipoUsuario.CLIENTE);
      expect(usuario.ativo).toBe(true);
      expect(usuario.cpf).toBe('12345678900');
      expect(usuario.telefone).toBe('11999999999');
      expect(usuario.endereco).toBe('Rua das Flores, 123');
      expect(usuario.createdAt).toBeDefined();
      expect(usuario.updatedAt).toBeDefined();
    });

    it('deve gerar um ID único se não fornecido', () => {
      const usuario1 = new MockUsuario(validUsuarioProps);
      const usuario2 = new MockUsuario(validUsuarioProps);

      expect(usuario1.id).toBeDefined();
      expect(usuario2.id).toBeDefined();
      expect(usuario1.id).not.toBe(usuario2.id);
    });

    it('deve usar o ID fornecido se especificado', () => {
      const customId = 'usr_custom_123';
      const usuario = new MockUsuario({ ...validUsuarioProps, id: customId });

      expect(usuario.id).toBe(customId);
    });
  });

  describe('Validações', () => {
    it('deve lançar erro para nome muito curto', () => {
      expect(() => {
        new MockUsuario({ ...validUsuarioProps, nome: 'A' });
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('deve lançar erro para email inválido', () => {
      expect(() => {
        new MockUsuario({ ...validUsuarioProps, email: 'email-invalido' });
      }).toThrow('Email deve ter um formato válido');
    });

    it('deve lançar erro para senha muito curta', () => {
      expect(() => {
        new MockUsuario({ ...validUsuarioProps, senha: '123' });
      }).toThrow('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve lançar erro para CPF inválido quando fornecido', () => {
      expect(() => {
        new MockUsuario({ ...validUsuarioProps, cpf: '123' });
      }).toThrow('CPF deve ter 11 dígitos');
    });

    it('deve lançar erro para telefone inválido quando fornecido', () => {
      expect(() => {
        new MockUsuario({ ...validUsuarioProps, telefone: '123' });
      }).toThrow('Telefone deve ter entre 10 e 11 dígitos');
    });
  });

  describe('Métodos utilitários', () => {
    it('deve verificar se é admin', () => {
      const admin = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN });
      const cliente = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.CLIENTE });

      expect(admin.ehAdmin()).toBe(true);
      expect(cliente.ehAdmin()).toBe(false);
    });

    it('deve verificar se é cliente', () => {
      const admin = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN });
      const cliente = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.CLIENTE });

      expect(admin.ehCliente()).toBe(false);
      expect(cliente.ehCliente()).toBe(true);
    });

    it('deve verificar se pode gerenciar veículos', () => {
      const adminAtivo = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN, ativo: true });
      const adminInativo = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN, ativo: false });
      const cliente = new MockUsuario({ ...validUsuarioProps, tipo: TipoUsuario.CLIENTE, ativo: true });

      expect(adminAtivo.podeGerenciarVeiculos()).toBe(true);
      expect(adminInativo.podeGerenciarVeiculos()).toBe(false);
      expect(cliente.podeGerenciarVeiculos()).toBe(false);
    });
  });

  describe('Serialização', () => {
    it('deve retornar objeto JSON com todas as propriedades', () => {
      const usuario = new MockUsuario(validUsuarioProps);
      const obj = usuario.toJSON();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('nome');
      expect(obj).toHaveProperty('email');
      expect(obj).toHaveProperty('senha');
      expect(obj).toHaveProperty('tipo');
      expect(obj).toHaveProperty('ativo');
      expect(obj).toHaveProperty('cpf');
      expect(obj).toHaveProperty('telefone');
      expect(obj).toHaveProperty('endereco');
      expect(obj).toHaveProperty('createdAt');
      expect(obj).toHaveProperty('updatedAt');
    });

    it('deve retornar objeto sem senha para resposta segura', () => {
      const usuario = new MockUsuario(validUsuarioProps);
      const obj = usuario.toSafeJSON();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('nome');
      expect(obj).toHaveProperty('email');
      expect(obj).toHaveProperty('tipo');
      expect(obj).toHaveProperty('ativo');
      expect(obj).not.toHaveProperty('senha');
    });
  });
});
