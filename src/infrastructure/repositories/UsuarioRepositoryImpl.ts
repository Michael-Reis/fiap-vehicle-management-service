import { Usuario, TipoUsuario, UsuarioProps } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { DatabaseConnection } from '../database/DatabaseConnection';

export class UsuarioRepositoryImpl implements UsuarioRepository {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const sql = `
      INSERT INTO usuarios (id, nome, email, senha, tipo, ativo, cpf, telefone, endereco)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.senha,
      usuario.tipo,
      usuario.ativo,
      usuario.cpf || null,
      usuario.telefone || null,
      usuario.endereco || null
    ];

    await this.db.execute(sql, params);
    return usuario;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    const rows = await this.db.query(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Usuario({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo: row.tipo as TipoUsuario,
      ativo: Boolean(row.ativo),
      cpf: row.cpf,
      telefone: row.telefone,
      endereco: row.endereco,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    const rows = await this.db.query(sql, [email]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Usuario({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo: row.tipo as TipoUsuario,
      ativo: Boolean(row.ativo),
      cpf: row.cpf,
      telefone: row.telefone,
      endereco: row.endereco,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async buscarPorCpf(cpf: string): Promise<Usuario | null> {
    const sql = 'SELECT * FROM usuarios WHERE cpf = ?';
    const rows = await this.db.query(sql, [cpf]);
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Usuario({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo: row.tipo as TipoUsuario,
      ativo: Boolean(row.ativo),
      cpf: row.cpf,
      telefone: row.telefone,
      endereco: row.endereco,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async buscarTodos(): Promise<Usuario[]> {
    const sql = 'SELECT * FROM usuarios ORDER BY nome ASC';
    const rows = await this.db.query(sql);
    
    return rows.map((row: any) => new Usuario({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo: row.tipo as TipoUsuario,
      ativo: Boolean(row.ativo),
      cpf: row.cpf,
      telefone: row.telefone,
      endereco: row.endereco,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async buscarPorTipo(tipo: TipoUsuario): Promise<Usuario[]> {
    const sql = 'SELECT * FROM usuarios WHERE tipo = ? ORDER BY nome ASC';
    const rows = await this.db.query(sql, [tipo]);
    
    return rows.map((row: any) => new Usuario({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      tipo: row.tipo as TipoUsuario,
      ativo: Boolean(row.ativo),
      cpf: row.cpf,
      telefone: row.telefone,
      endereco: row.endereco,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async atualizar(id: string, usuarioData: Partial<Usuario>): Promise<Usuario> {
    // Primeiro busca o usuário atual
    const usuarioAtual = await this.buscarPorId(id);
    if (!usuarioAtual) {
      throw new Error('Usuário não encontrado');
    }

    // Atualiza os dados
    const campos: string[] = [];
    const valores: any[] = [];
    
    if (usuarioData.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(usuarioData.nome);
    }
    if (usuarioData.email !== undefined) {
      campos.push('email = ?');
      valores.push(usuarioData.email);
    }
    if (usuarioData.senha !== undefined) {
      campos.push('senha = ?');
      valores.push(usuarioData.senha);
    }
    if (usuarioData.tipo !== undefined) {
      campos.push('tipo = ?');
      valores.push(usuarioData.tipo);
    }
    if (usuarioData.ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(usuarioData.ativo);
    }
    if (usuarioData.cpf !== undefined) {
      campos.push('cpf = ?');
      valores.push(usuarioData.cpf);
    }
    if (usuarioData.telefone !== undefined) {
      campos.push('telefone = ?');
      valores.push(usuarioData.telefone);
    }
    if (usuarioData.endereco !== undefined) {
      campos.push('endereco = ?');
      valores.push(usuarioData.endereco);
    }

    campos.push('updated_at = ?');
    valores.push(new Date());
    
    valores.push(id);

    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    await this.db.execute(sql, valores);
    
    return await this.buscarPorId(id) as Usuario;
  }

  async deletar(id: string): Promise<void> {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    await this.db.execute(sql, [id]);
  }

  async existePorEmail(email: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ?';
    const rows = await this.db.query(sql, [email]);
    return rows[0].count > 0;
  }

  async existePorCpf(cpf: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM usuarios WHERE cpf = ?';
    const rows = await this.db.query(sql, [cpf]);
    return rows[0].count > 0;
  }
}
