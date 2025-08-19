import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { TipoUsuario } from '../../../domain/entities/Usuario';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tipo: TipoUsuario;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Token de acesso não fornecido' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'secret_default';
    const decoded = jwt.verify(token, jwtSecret) as any;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      tipo: decoded.tipo
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  if (req.user.tipo !== TipoUsuario.ADMIN) {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso' });
    return;
  }

  next();
};

export const clienteMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  if (req.user.tipo !== TipoUsuario.CLIENTE) {
    res.status(403).json({ error: 'Acesso negado. Apenas clientes podem acessar este recurso' });
    return;
  }

  next();
};
