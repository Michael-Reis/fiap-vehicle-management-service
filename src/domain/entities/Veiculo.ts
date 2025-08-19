export enum StatusVeiculo {
  A_VENDA = 'A_VENDA',
  VENDIDO = 'VENDIDO',
  RESERVADO = 'RESERVADO'
}

export interface VeiculoProps {
  id?: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
  status: StatusVeiculo;
  cpfComprador?: string;
  dataVenda?: Date;
  codigoPagamento?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Veiculo {
  private readonly _id: string;
  private _marca: string;
  private _modelo: string;
  private _ano: number;
  private _cor: string;
  private _preco: number;
  private _status: StatusVeiculo;
  private _cpfComprador?: string;
  private _dataVenda?: Date;
  private _codigoPagamento?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: VeiculoProps, skipValidation: boolean = false) {
    this._id = props.id || this.generateId();
    this._marca = props.marca;
    this._modelo = props.modelo;
    this._ano = props.ano;
    this._cor = props.cor;
    this._preco = props.preco;
    this._status = props.status;
    this._cpfComprador = props.cpfComprador;
    this._dataVenda = props.dataVenda;
    this._codigoPagamento = props.codigoPagamento;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();

    if (!skipValidation) {
      this.validate();
    }
  }

  private generateId(): string {
    return `veh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this._marca || this._marca.trim().length === 0) {
      throw new Error('Marca é obrigatória');
    }

    if (!this._modelo || this._modelo.trim().length === 0) {
      throw new Error('Modelo é obrigatório');
    }

    if (this._ano < 1900 || this._ano > new Date().getFullYear() + 1) {
      const anoAtual = new Date().getFullYear();
      throw new Error(`Ano deve estar entre 1900 e ${anoAtual + 1}`);
    }

    if (!this._cor || this._cor.trim().length === 0) {
      throw new Error('Cor é obrigatória');
    }

    if (this._preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (this._cpfComprador && !this.isValidCPF(this._cpfComprador)) {
      throw new Error('CPF inválido');
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
  get marca(): string { return this._marca; }
  get modelo(): string { return this._modelo; }
  get ano(): number { return this._ano; }
  get cor(): string { return this._cor; }
  get preco(): number { return this._preco; }
  get status(): StatusVeiculo { return this._status; }
  get cpfComprador(): string | undefined { return this._cpfComprador; }
  get dataVenda(): Date | undefined { return this._dataVenda; }
  get codigoPagamento(): string | undefined { return this._codigoPagamento; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de negócio
  atualizarDados(props: Partial<VeiculoProps>): void {
    if (props.marca !== undefined) this._marca = props.marca;
    if (props.modelo !== undefined) this._modelo = props.modelo;
    if (props.ano !== undefined) this._ano = props.ano;
    if (props.cor !== undefined) this._cor = props.cor;
    if (props.preco !== undefined) this._preco = props.preco;
    
    this._updatedAt = new Date();
    this.validate();
  }

  marcarComoVendido(cpfComprador: string, codigoPagamento: string): void {
    if (this._status === StatusVeiculo.VENDIDO) {
      throw new Error('Veículo já foi vendido');
    }

    this._status = StatusVeiculo.VENDIDO;
    this._cpfComprador = cpfComprador;
    this._dataVenda = new Date();
    this._codigoPagamento = codigoPagamento;
    this._updatedAt = new Date();
    
    this.validate();
  }

  marcarComoReservado(cpfComprador: string, codigoPagamento: string): void {
    if (this._status !== StatusVeiculo.A_VENDA) {
      throw new Error('Veículo não está disponível para reserva');
    }

    this._status = StatusVeiculo.RESERVADO;
    this._cpfComprador = cpfComprador;
    this._codigoPagamento = codigoPagamento;
    this._updatedAt = new Date();
    
    this.validate();
  }

  voltarParaVenda(): void {
    this._status = StatusVeiculo.A_VENDA;
    this._cpfComprador = undefined;
    this._dataVenda = undefined;
    this._codigoPagamento = undefined;
    this._updatedAt = new Date();
  }

  estaDisponivel(): boolean {
    return this._status === StatusVeiculo.A_VENDA;
  }

  toJSON(): VeiculoProps {
    return {
      id: this._id,
      marca: this._marca,
      modelo: this._modelo,
      ano: this._ano,
      cor: this._cor,
      preco: this._preco,
      status: this._status,
      cpfComprador: this._cpfComprador,
      dataVenda: this._dataVenda,
      codigoPagamento: this._codigoPagamento,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}
