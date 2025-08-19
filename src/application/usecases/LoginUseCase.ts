import { Usuario, UsuarioProps } from '../../domain/entities/Usuario';
import { UsuarioRepository } from '../../domain/repositories/UsuarioRepository';
import { UsuarioRepositoryImpl } from '../../infrastructure/repositories/UsuarioRepositoryImpl';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginOutput {
  usuario: Omit<UsuarioProps, 'senha'>;
  token: string;
  message: string;
}

export class LoginUseCase {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepositoryImpl();
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Buscar usuário por email
    const usuario = await this.usuarioRepository.buscarPorEmail(input.email);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar se usuário está ativo
    if (!usuario.estaAtivo()) {
      throw new Error('Usuário inativo');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(input.senha, usuario.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'secret_default';
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo
    };
    const options: jwt.SignOptions = {
      expiresIn: 200000
    };
    const token = jwt.sign(payload, jwtSecret, options);

    return {
      usuario: usuario.toSafeJSON(),
      token,
      message: 'Login realizado com sucesso'
    };
  }
}
