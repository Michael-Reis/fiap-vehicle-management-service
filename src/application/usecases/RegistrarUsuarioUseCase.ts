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
}
