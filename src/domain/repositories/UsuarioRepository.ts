import { Usuario, TipoUsuario } from '../entities/Usuario';

export interface UsuarioRepository {
  salvar(usuario: Usuario): Promise<Usuario>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorCpf(cpf: string): Promise<Usuario | null>;
  buscarTodos(): Promise<Usuario[]>;
  buscarPorTipo(tipo: TipoUsuario): Promise<Usuario[]>;
  atualizar(id: string, usuario: Partial<Usuario>): Promise<Usuario>;
  deletar(id: string): Promise<void>;
  existePorEmail(email: string): Promise<boolean>;
  existePorCpf(cpf: string): Promise<boolean>;
}

export interface FiltrosUsuario {
  nome?: string;
  email?: string;
  tipo?: TipoUsuario;
  ativo?: boolean;
}
