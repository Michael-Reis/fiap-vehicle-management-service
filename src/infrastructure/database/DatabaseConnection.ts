import mysql from 'mysql2/promise';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: mysql.Connection | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'servico_principal',
        port: parseInt(process.env.DB_PORT || '3306'),
        charset: 'utf8mb4'
      });
      
      console.log('Conectado ao banco MySQL do serviço principal');
    } catch (error) {
      console.error('Erro ao conectar no MySQL:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('Desconectado do banco MySQL');
    }
  }

  getConnection(): mysql.Connection {
    if (!this.connection) {
      throw new Error('Database não conectado');
    }
    return this.connection;
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    const [result] = await this.getConnection().execute(sql, params);
    return result;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const [rows] = await this.getConnection().execute(sql, params);
    return rows;
  }

  async initializeSchema(): Promise<void> {
    // Tabela de usuários
    const createUsuariosTable = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(50) PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        tipo ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
        ativo BOOLEAN NOT NULL DEFAULT 1,
        cpf VARCHAR(11) NULL,
        telefone VARCHAR(20) NULL,
        endereco TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_usuarios_email (email),
        INDEX idx_usuarios_cpf (cpf),
        INDEX idx_usuarios_tipo (tipo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;

    // Tabela de veículos
    const createVeiculosTable = `
      CREATE TABLE IF NOT EXISTS veiculos (
        id VARCHAR(50) PRIMARY KEY,
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        ano INT NOT NULL,
        cor VARCHAR(50) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        status ENUM('A_VENDA', 'VENDIDO') NOT NULL DEFAULT 'A_VENDA',
        cpf_comprador VARCHAR(11) NULL,
        data_venda DATETIME NULL,
        codigo_pagamento VARCHAR(100) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_veiculos_status (status),
        INDEX idx_veiculos_preco (preco),
        INDEX idx_veiculos_marca (marca),
        INDEX idx_veiculos_codigo_pagamento (codigo_pagamento)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;

    await this.execute(createUsuariosTable);
    await this.execute(createVeiculosTable);
    
    // Migração: Alterar tamanho das colunas id se necessário
    try {
      await this.execute('ALTER TABLE usuarios MODIFY COLUMN id VARCHAR(50)');
      await this.execute('ALTER TABLE veiculos MODIFY COLUMN id VARCHAR(50)');
    } catch (error) {
      // Ignora erros se as colunas já estiverem no tamanho correto
      console.log('Migração de colunas id já aplicada ou não necessária');
    }
    
    console.log('Schema do banco de dados MySQL inicializado');
  }
}
