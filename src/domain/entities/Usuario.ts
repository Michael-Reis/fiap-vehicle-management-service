import { v4 as uuidv4 } from 'uuid';

export enum TipoUsuario {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE'
}

export interface UsuarioProps {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  ativo: boolean;
  cpf?: string; // Para clientes
  telefone?: string; // Para clientes
  endereco?: string; // Para clientes
  createdAt?: Date;
  updatedAt?: Date;
}

export class Usuario {
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
    return `usr_${uuidv4()}`;
  }
  private validate(): void {
    if (!this._nome || this._nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (!this._email || !this.isValidEmail(this._email)) {
      throw new Error('Email inválido');
    }

    if (!this._senha || this._senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Validações específicas para clientes
    if (this._tipo === TipoUsuario.CLIENTE) {
      if (!this._cpf || !this.isValidCPF(this._cpf)) {
        throw new Error('CPF é obrigatório e deve ser válido para clientes');
      }
    }
  }


  private isValidEmail(email: string): boolean {
    try {
      const [local, domain] = email.split('@');
      if (!local || !domain) return false;
      if (local.length < 1 || domain.length < 3) return false;
      if (!domain.includes('.')) return false;
      if (domain.startsWith('.') || domain.endsWith('.')) return false;
      return true;
    } catch {
      return false;
    }
  }


  private isValidCPF(cpf: string): boolean {
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
  }

  // Getters
  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get email(): string { return this._email; }
  get senha(): string { return this._senha; }
  get tipo(): TipoUsuario { return this._tipo; }
  get ativo(): boolean { return this._ativo; }
  get cpf(): string | undefined { return this._cpf; }
  get telefone(): string | undefined { return this._telefone; }
  get endereco(): string | undefined { return this._endereco; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de negócio
  atualizarDados(props: Partial<UsuarioProps>): void {
    if (props.nome !== undefined) this._nome = props.nome;
    if (props.email !== undefined) this._email = props.email;
    if (props.tipo !== undefined) this._tipo = props.tipo;
    if (props.cpf !== undefined) this._cpf = props.cpf;
    if (props.telefone !== undefined) this._telefone = props.telefone;
    if (props.endereco !== undefined) this._endereco = props.endereco;

    this._updatedAt = new Date();
    this.validate();
  }

  alterarSenha(novaSenha: string): void {
    if (!novaSenha || novaSenha.length < 6) {
      throw new Error('Nova senha deve ter pelo menos 6 caracteres');
    }

    this._senha = novaSenha;
    this._updatedAt = new Date();
  }

  ativar(): void {
    this._ativo = true;
    this._updatedAt = new Date();
  }

  desativar(): void {
    this._ativo = false;
    this._updatedAt = new Date();
  }

  estaAtivo(): boolean {
    return this._ativo;
  }

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
