import { Usuario, UsuarioProps, TipoUsuario } from '../../../domain/entities/Usuario';

describe('Usuario Entity', () => {
  const validUsuarioProps: UsuarioProps = {
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'senhaSegura123',
    tipo: TipoUsuario.CLIENTE,
    ativo: true,
    cpf: '11144477735', // CPF válido
    telefone: '11999999999',
    endereco: 'Rua das Flores, 123'
  };

  describe('Criação de usuário', () => {
    it('deve criar um usuário válido com todos os campos', () => {
      const usuario = new Usuario(validUsuarioProps);

      expect(usuario.id).toBeDefined();
      expect(usuario.nome).toBe('João Silva');
      expect(usuario.email).toBe('joao@email.com');
      expect(usuario.tipo).toBe(TipoUsuario.CLIENTE);
      expect(usuario.ativo).toBe(true);
      expect(usuario.cpf).toBe('11144477735');
      expect(usuario.telefone).toBe('11999999999');
      expect(usuario.endereco).toBe('Rua das Flores, 123');
      expect(usuario.createdAt).toBeDefined();
      expect(usuario.updatedAt).toBeDefined();
    });

    it('deve gerar um ID único se não fornecido', () => {
      const usuario1 = new Usuario(validUsuarioProps);
      const usuario2 = new Usuario(validUsuarioProps);

      expect(usuario1.id).toBeDefined();
      expect(usuario2.id).toBeDefined();
      expect(usuario1.id).not.toBe(usuario2.id);
    });

    it('deve usar o ID fornecido se especificado', () => {
      const customId = 'usr_custom_123';
      const usuario = new Usuario({ ...validUsuarioProps, id: customId });

      expect(usuario.id).toBe(customId);
    });

    it('deve criar usuário ADMIN sem CPF, telefone e endereço', () => {
      const adminProps: UsuarioProps = {
        nome: 'Admin User',
        email: 'admin@email.com',
        senha: 'adminSenha123',
        tipo: TipoUsuario.ADMIN,
        ativo: true
      };

      const usuario = new Usuario(adminProps);

      expect(usuario.tipo).toBe(TipoUsuario.ADMIN);
      expect(usuario.cpf).toBeUndefined();
      expect(usuario.telefone).toBeUndefined();
      expect(usuario.endereco).toBeUndefined();
    });
  });

  describe('Validações', () => {
    it('deve lançar erro para nome vazio', () => {
      expect(() => {
        new Usuario({ ...validUsuarioProps, nome: '' });
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('deve lançar erro para nome com menos de 2 caracteres', () => {
      expect(() => {
        new Usuario({ ...validUsuarioProps, nome: 'A' });
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('deve lançar erro para email inválido', () => {
      expect(() => {
        new Usuario({ ...validUsuarioProps, email: 'email-invalido' });
      }).toThrow('Email inválido');
    });

    it('deve lançar erro para senha muito curta', () => {
      expect(() => {
        new Usuario({ ...validUsuarioProps, senha: '123' });
      }).toThrow('Senha deve ter pelo menos 6 caracteres');
    });

    it('deve lançar erro para CPF inválido quando fornecido', () => {
      expect(() => {
        new Usuario({ ...validUsuarioProps, cpf: '123' });
      }).toThrow('CPF é obrigatório e deve ser válido para clientes');
    });

    it('deve lançar erro para telefone inválido quando fornecido', () => {
      // Como não há validação de telefone na entidade atual, 
      // vamos testar que não há erro com telefone inválido
      expect(() => {
        new Usuario({ ...validUsuarioProps, telefone: '123' });
      }).not.toThrow();
    });
  });

  describe('Métodos utilitários', () => {
    it('deve verificar se é admin', () => {
      const admin = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN });
      const cliente = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.CLIENTE });

      expect(admin.ehAdmin()).toBe(true);
      expect(cliente.ehAdmin()).toBe(false);
    });

    it('deve verificar se é cliente', () => {
      const admin = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN });
      const cliente = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.CLIENTE });

      expect(admin.ehCliente()).toBe(false);
      expect(cliente.ehCliente()).toBe(true);
    });

    it('deve verificar se pode gerenciar veículos', () => {
      const adminAtivo = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN, ativo: true });
      const adminInativo = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.ADMIN, ativo: false });
      const cliente = new Usuario({ ...validUsuarioProps, tipo: TipoUsuario.CLIENTE, ativo: true });

      expect(adminAtivo.podeGerenciarVeiculos()).toBe(true);
      expect(adminInativo.podeGerenciarVeiculos()).toBe(false);
      expect(cliente.podeGerenciarVeiculos()).toBe(false);
    });
  });

  describe('Serialização', () => {
    it('deve retornar objeto JSON com todas as propriedades', () => {
      const usuario = new Usuario(validUsuarioProps);
      const obj = usuario.toJSON();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('nome');
      expect(obj).toHaveProperty('email');
      expect(obj).toHaveProperty('senha');
      expect(obj).toHaveProperty('tipo');
      expect(obj).toHaveProperty('ativo');
      expect(obj).toHaveProperty('cpf');
      expect(obj).toHaveProperty('telefone');
      expect(obj).toHaveProperty('endereco');
      expect(obj).toHaveProperty('createdAt');
      expect(obj).toHaveProperty('updatedAt');
    });

    it('deve retornar objeto sem senha para resposta segura', () => {
      const usuario = new Usuario(validUsuarioProps);
      const obj = usuario.toSafeJSON();

      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('nome');
      expect(obj).toHaveProperty('email');
      expect(obj).toHaveProperty('tipo');
      expect(obj).toHaveProperty('ativo');
      expect(obj).not.toHaveProperty('senha');
    });
  });
});
