import { Veiculo, StatusVeiculo, VeiculoProps } from '../../domain/entities/Veiculo';
import { VeiculoRepository, OrdemClassificacao } from '../../domain/repositories/VeiculoRepository';
import { DatabaseConnection } from '../database/DatabaseConnection';

export class VeiculoRepositoryImpl implements VeiculoRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async salvar(veiculo: Veiculo): Promise<Veiculo> {
    const sql = `
      INSERT INTO veiculos (id, marca, modelo, ano, cor, preco, status, cpf_comprador, data_venda, codigo_pagamento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      veiculo.id,
      veiculo.marca,
      veiculo.modelo,
      veiculo.ano,
      veiculo.cor,
      veiculo.preco,
      veiculo.status,
      veiculo.cpfComprador || null,
      veiculo.dataVenda || null,
      veiculo.codigoPagamento || null
    ];

    await this.db.execute(sql, params);
    return veiculo;
  }

  async buscarPorId(id: string): Promise<Veiculo | null> {
    const sql = 'SELECT * FROM veiculos WHERE id = ?';
    const rows = await this.db.query(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Veiculo({
      id: row.id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      preco: row.preco,
      status: row.status as StatusVeiculo,
      cpfComprador: row.cpf_comprador,
      dataVenda: row.data_venda,
      codigoPagamento: row.codigo_pagamento,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }, true); // Pular validação ao carregar do banco
  }

  async buscarTodos(): Promise<Veiculo[]> {
    const sql = 'SELECT * FROM veiculos ORDER BY preco ASC';
    const rows = await this.db.query(sql);
    
    return rows.map((row: any) => new Veiculo({
      id: row.id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      preco: row.preco,
      status: row.status as StatusVeiculo,
      cpfComprador: row.cpf_comprador,
      dataVenda: row.data_venda,
      codigoPagamento: row.codigo_pagamento,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }, true)); // Pular validação ao carregar do banco
  }

  async buscarPorStatus(status: StatusVeiculo): Promise<Veiculo[]> {
    const sql = 'SELECT * FROM veiculos WHERE status = ? ORDER BY preco ASC';
    const rows = await this.db.query(sql, [status]);
    
    return rows.map((row: any) => new Veiculo({
      id: row.id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      preco: row.preco,
      status: row.status as StatusVeiculo,
      cpfComprador: row.cpf_comprador,
      dataVenda: row.data_venda,
      codigoPagamento: row.codigo_pagamento,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }, true)); // Pular validação ao carregar do banco
  }

  async atualizar(id: string, veiculoData: Partial<Veiculo>): Promise<Veiculo> {
    // Primeiro busca o veículo atual
    const veiculoAtual = await this.buscarPorId(id);
    if (!veiculoAtual) {
      throw new Error('Veículo não encontrado');
    }

    // Atualiza os dados
    const campos: string[] = [];
    const valores: any[] = [];
    
    if (veiculoData.marca !== undefined) {
      campos.push('marca = ?');
      valores.push(veiculoData.marca);
    }
    if (veiculoData.modelo !== undefined) {
      campos.push('modelo = ?');
      valores.push(veiculoData.modelo);
    }
    if (veiculoData.ano !== undefined) {
      campos.push('ano = ?');
      valores.push(veiculoData.ano);
    }
    if (veiculoData.cor !== undefined) {
      campos.push('cor = ?');
      valores.push(veiculoData.cor);
    }
    if (veiculoData.preco !== undefined) {
      campos.push('preco = ?');
      valores.push(veiculoData.preco);
    }
    if (veiculoData.status !== undefined) {
      campos.push('status = ?');
      valores.push(veiculoData.status);
    }
    if (veiculoData.cpfComprador !== undefined) {
      campos.push('cpf_comprador = ?');
      valores.push(veiculoData.cpfComprador || null);
    }
    if (veiculoData.dataVenda !== undefined) {
      campos.push('data_venda = ?');
      valores.push(veiculoData.dataVenda || null);
    }
    if (veiculoData.codigoPagamento !== undefined) {
      campos.push('codigo_pagamento = ?');
      valores.push(veiculoData.codigoPagamento || null);
    }

    campos.push('updated_at = ?');
    valores.push(new Date());
    
    valores.push(id);

    const sql = `UPDATE veiculos SET ${campos.join(', ')} WHERE id = ?`;
    await this.db.execute(sql, valores);
    
    return await this.buscarPorId(id) as Veiculo;
  }

  async deletar(id: string): Promise<void> {
    const sql = 'DELETE FROM veiculos WHERE id = ?';
    await this.db.execute(sql, [id]);
  }

  async buscarDisponiveis(ordem: OrdemClassificacao = 'ASC'): Promise<Veiculo[]> {
    const orderDirection = ordem === 'DESC' ? 'DESC' : 'ASC';
    const sql = `
      SELECT * FROM veiculos 
      WHERE status = ? 
      ORDER BY preco ${orderDirection}
    `;
    
    const rows = await this.db.query(sql, [StatusVeiculo.A_VENDA]);
    
    return rows.map((row: any) => new Veiculo({
      id: row.id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      preco: row.preco,
      status: row.status as StatusVeiculo,
      cpfComprador: row.cpf_comprador,
      dataVenda: row.data_venda,
      codigoPagamento: row.codigo_pagamento,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }, true)); // Pular validação ao carregar do banco
  }

  async buscarVendidos(ordem: OrdemClassificacao = 'ASC'): Promise<Veiculo[]> {
    const orderDirection = ordem === 'DESC' ? 'DESC' : 'ASC';
    const sql = `
      SELECT * FROM veiculos 
      WHERE status = ? 
      ORDER BY preco ${orderDirection}
    `;
    
    const rows = await this.db.query(sql, [StatusVeiculo.VENDIDO]);
    
    return rows.map((row: any) => new Veiculo({
      id: row.id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      preco: row.preco,
      status: row.status as StatusVeiculo,
      cpfComprador: row.cpf_comprador,
      dataVenda: row.data_venda,
      codigoPagamento: row.codigo_pagamento,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }, true)); // Pular validação ao carregar do banco
  }

  async existePorId(id: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM veiculos WHERE id = ?';
    const rows = await this.db.query(sql, [id]);
    return rows[0].count > 0;
  }

  async buscarPorCodigoPagamento(codigoPagamento: string): Promise<Veiculo | null> {
    const sql = 'SELECT * FROM veiculos WHERE codigo_pagamento = ?';
    const rows = await this.db.query(sql, [codigoPagamento]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Veiculo({
      id: row.id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      preco: row.preco,
      status: row.status as StatusVeiculo,
      cpfComprador: row.cpf_comprador,
      dataVenda: row.data_venda,
      codigoPagamento: row.codigo_pagamento,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }, true); // Pular validação ao carregar do banco
  }
}
