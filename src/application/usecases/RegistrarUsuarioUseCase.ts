import { Usuario, TipoUsuario, UsuarioProps } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import bcrypt from 'bcryptjs';

export interface RegistrarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  cpf?: string;
  telefone?: string;
  endereco?: string;
}

export interface RegistrarUsuarioOutput {
  usuario: Omit<UsuarioProps, 'senha'>;
  message: string;
}

export class RegistrarUsuarioUseCase {
  constructor(private usuarioRepository: UsuarioRepository) {}

  async execute(input: RegistrarUsuarioInput): Promise<RegistrarUsuarioOutput> {
    // Validar entrada
    if (!input.nome || input.nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (!input.email || !this.isValidEmail(input.email)) {
      throw new Error('Email inválido');
    }

    if (!input.senha || input.senha.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (!input.tipo || Object.values(TipoUsuario).indexOf(input.tipo) === -1) {
      throw new Error('Tipo de usuário é obrigatório');
    }

    // Validar se email já existe
    const emailExiste = await this.usuarioRepository.existePorEmail(input.email);
    if (emailExiste) {
      throw new Error('Email já está em uso');
    }

    // Validar se CPF já existe (para clientes)
    if (input.tipo === TipoUsuario.CLIENTE && input.cpf) {
      const cpfExiste = await this.usuarioRepository.existePorCpf(input.cpf);
      if (cpfExiste) {
        throw new Error('CPF já está cadastrado');
      }
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(input.senha, 10);

    // Criar usuário
    const usuario = new Usuario({
      nome: input.nome,
      email: input.email,
      senha: senhaHash,
      tipo: input.tipo,
      ativo: true,
      cpf: input.cpf,
      telefone: input.telefone,
      endereco: input.endereco
    });

    // Salvar usuário
    const usuarioSalvo = await this.usuarioRepository.salvar(usuario);

    return {
      usuario: usuarioSalvo.toSafeJSON(),
      message: 'Usuário registrado com sucesso'
    };
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
}
