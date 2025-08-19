import { DatabaseConnection } from './DatabaseConnection';
import * as bcrypt from 'bcrypt';
import { TipoUsuario } from '../../domain/entities/Usuario';

export class DatabaseSeed {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async criarAdminInicial(): Promise<void> {
    try {
      await this.db.connect();
      
      // Verificar se já existe um admin com o email padrão
      const adminExistente = await this.db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        ['admin@admin.com.br']
      );

      if (adminExistente.length > 0) {
        console.log('Admin inicial já existe. Seed não executado.');
        return;
      }

      // Criar hash da senha
      const senhaHash = await bcrypt.hash('123456789', 10);

      // Inserir admin inicial
      await this.db.query(
        `INSERT INTO usuarios (nome, email, senha, tipo, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          'Administrador Sistema',
          'admin@admin.com.br',
          senhaHash,
          TipoUsuario.ADMIN
        ]
      );

      console.log('Admin inicial criado com sucesso!');
      console.log('Email: admin@admin.com.br');
      console.log('Senha: 123456789');
      
    } catch (error) {
      console.error('Erro ao criar admin inicial:', error);
      throw error;
    }
  }

  async executar(): Promise<void> {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    try {
      await this.criarAdminInicial();
      console.log('Seed executado com sucesso!');
    } catch (error) {
      console.error('Erro durante o seed:', error);
      process.exit(1);
    }
  }
}

// Executar seed se este arquivo for executado diretamente
if (require.main === module) {
  const seed = new DatabaseSeed();
  seed.executar()
    .then(() => {
      console.log('Seed finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal durante seed:', error);
      process.exit(1);
    });
}
