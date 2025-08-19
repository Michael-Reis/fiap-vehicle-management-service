import { Request, Response } from 'express';
import { RegistrarUsuarioUseCase } from '../../../application/usecases/RegistrarUsuarioUseCase';
import { LoginUseCase } from '../../../application/usecases/LoginUseCase';
import { UsuarioRepositoryImpl } from '../../repositories/UsuarioRepositoryImpl';
import { TipoUsuario } from '../../../domain/entities/Usuario';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  private registrarUsuarioUseCase: RegistrarUsuarioUseCase;
  private loginUseCase: LoginUseCase;

  constructor() {
    const usuarioRepository = new UsuarioRepositoryImpl();
    this.registrarUsuarioUseCase = new RegistrarUsuarioUseCase(usuarioRepository);
    this.loginUseCase = new LoginUseCase();
  }

  async registrar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { nome, email, senha, tipo, cpf, telefone, endereco } = req.body;

      // Validações básicas
      if (!nome || !email || !senha || !tipo) {
        res.status(400).json({ 
          error: 'Dados obrigatórios faltando',
          details: 'Nome, email, senha e tipo são obrigatórios'
        });
        return;
      }

      // Apenas admins podem criar outros admins
      if (tipo === TipoUsuario.ADMIN) {
        if (!req.user || req.user.tipo !== TipoUsuario.ADMIN) {
          res.status(403).json({ 
            error: 'Acesso negado. Apenas administradores podem criar outros administradores'
          });
          return;
        }
      }

      // Validação específica para clientes
      if (tipo === TipoUsuario.CLIENTE && !cpf) {
        res.status(400).json({ 
          error: 'CPF é obrigatório para clientes'
        });
        return;
      }

      const result = await this.registrarUsuarioUseCase.execute({
        nome,
        email,
        senha,
        tipo,
        cpf,
        telefone,
        endereco
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao registrar usuário'
      });
    }
  }

  async registrarCliente(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, cpf, telefone, endereco } = req.body;

      // Validações básicas
      if (!nome || !email || !senha || !cpf) {
        res.status(400).json({ 
          error: 'Dados obrigatórios faltando',
          details: 'Nome, email, senha e CPF são obrigatórios para clientes'
        });
        return;
      }

      const result = await this.registrarUsuarioUseCase.execute({
        nome,
        email,
        senha,
        tipo: TipoUsuario.CLIENTE,
        cpf,
        telefone,
        endereco
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao registrar cliente:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao registrar cliente'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ 
          error: 'Email e senha são obrigatórios'
        });
        return;
      }

      const result = await this.loginUseCase.execute({ email, senha });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      res.status(401).json({ 
        error: error.message || 'Erro ao fazer login'
      });
    }
  }
}
