import { DatabaseConnection } from './DatabaseConnection';
import * as bcrypt from 'bcrypt';
import { TipoUsuario } from '../../domain/entities/Usuario';
import { randomBytes } from 'crypto';

export class DatabaseSeed {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async criarAdminInicial(): Promise<void> {
    try {
      await this.db.connect();
      
      // Usar senha configurada por variável de ambiente ou gerar uma temporária
      const senhaAdmin = process.env.ADMIN_PASSWORD || this.gerarSenhaSegura();
      const senhaHash = await bcrypt.hash(senhaAdmin, 10);
      
      // Verificar se já existe um admin com o email padrão
      const adminExistente = await this.db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        ['admin@admin.com.br']
      );

      if (adminExistente.length > 0) {
        // Admin já existe, vamos atualizar a senha
        await this.db.query(
          'UPDATE usuarios SET senha = ?, updated_at = NOW() WHERE email = ?',
          [senhaHash, 'admin@admin.com.br']
        );
        
        console.log('Admin inicial já existe - senha atualizada com sucesso!');
        console.log('Email: admin@admin.com.br');
        
        if (process.env.ADMIN_PASSWORD) {
          console.log('✅ Senha atualizada através da variável de ambiente ADMIN_PASSWORD');
        } else {
          console.log(`⚠️  Senha temporária atualizada: ${senhaAdmin}`);
          console.log('⚠️  IMPORTANTE: Altere esta senha no primeiro login!');
          console.log('💡 TIP: Configure a variável ADMIN_PASSWORD para definir uma senha fixa');
        }
        return;
      }

      const id = 'admin_' + new Date().getTime(); // Gera um ID único baseado no timestamp  

      // Inserir admin inicial
      await this.db.query(
        `INSERT INTO usuarios (id, nome, email, senha, tipo, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          'Administrador Sistema',
          'admin@admin.com.br',
          senhaHash,
          TipoUsuario.ADMIN
        ]
      );

      console.log('Admin inicial criado com sucesso!');
      console.log('Email: admin@admin.com.br');
      
      if (process.env.ADMIN_PASSWORD) {
        console.log('✅ Senha definida através da variável de ambiente ADMIN_PASSWORD');
      } else {
        console.log(`⚠️  Senha temporária gerada: ${senhaAdmin}`);
        console.log('⚠️  IMPORTANTE: Altere esta senha no primeiro login!');
        console.log('💡 TIP: Configure a variável ADMIN_PASSWORD para definir uma senha fixa');
      }
      
    } catch (error) {
      console.error('Erro ao criar admin inicial:', error);
      throw error;
    }
  }

  /**
   * Gera uma senha segura usando gerador criptográfico
   * Substitui Math.random() por crypto.randomBytes para segurança
   */
  private gerarSenhaSegura(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let senha = '';
    const randomBytesArray = randomBytes(12); // Gera 12 bytes criptograficamente seguros
    
    for (let i = 0; i < 12; i++) {
      // Usa bytes seguros em vez de Math.random()
      senha += charset.charAt(randomBytesArray[i] % charset.length);
    }
    return senha;
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
