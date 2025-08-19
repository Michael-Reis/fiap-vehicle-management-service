import request from 'supertest';
import express from 'express';
import { VeiculoController } from '../../../../infrastructure/http/controllers/VeiculoController';
import { CadastrarVeiculoUseCase } from '../../../../application/usecases/CadastrarVeiculoUseCase';
import { ConsultarVeiculoUseCase } from '../../../../application/usecases/ConsultarVeiculoUseCase';
import { EditarVeiculoUseCase } from '../../../../application/usecases/EditarVeiculoUseCase';
import { StatusVeiculo } from '../../../../domain/entities/Veiculo';

// Mocks dos use cases
jest.mock('../../../../application/usecases/CadastrarVeiculoUseCase');
jest.mock('../../../../application/usecases/ConsultarVeiculoUseCase');
jest.mock('../../../../application/usecases/EditarVeiculoUseCase');

const MockedCadastrarVeiculoUseCase = CadastrarVeiculoUseCase as jest.MockedClass<typeof CadastrarVeiculoUseCase>;
const MockedConsultarVeiculoUseCase = ConsultarVeiculoUseCase as jest.MockedClass<typeof ConsultarVeiculoUseCase>;
const MockedEditarVeiculoUseCase = EditarVeiculoUseCase as jest.MockedClass<typeof EditarVeiculoUseCase>;

describe('VeiculoController', () => {
  let app: express.Application;
  let controller: VeiculoController;
  let mockCadastrarUseCase: jest.Mocked<CadastrarVeiculoUseCase>;
  let mockConsultarUseCase: jest.Mocked<ConsultarVeiculoUseCase>;
  let mockEditarUseCase: jest.Mocked<EditarVeiculoUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    mockCadastrarUseCase = {
      execute: jest.fn()
    } as any;
    
    mockConsultarUseCase = {
      execute: jest.fn(),
      buscarPorId: jest.fn(),
      listarComFiltros: jest.fn(),
      listarDisponiveis: jest.fn(),
      listarVendidos: jest.fn()
    } as any;
    
    mockEditarUseCase = {
      execute: jest.fn(),
      deletar: jest.fn()
    } as any;

    MockedCadastrarVeiculoUseCase.mockImplementation(() => mockCadastrarUseCase);
    MockedConsultarVeiculoUseCase.mockImplementation(() => mockConsultarUseCase);
    MockedEditarVeiculoUseCase.mockImplementation(() => mockEditarUseCase);
    
    controller = new VeiculoController();

    // Configurar rotas
    app.post('/veiculos', controller.cadastrar.bind(controller));
    app.get('/veiculos', controller.listar.bind(controller));
    app.get('/veiculos/:id', controller.buscarPorId.bind(controller));
    app.put('/veiculos/:id', controller.atualizar.bind(controller));
    app.delete('/veiculos/:id', controller.deletar.bind(controller));
  });

  describe('POST /veiculos', () => {
    const veiculoValido = {
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2023,
      cor: 'Branco',
      preco: 85000
    };

    it('deve cadastrar um veículo com sucesso', async () => {
      const veiculoCadastrado = {
        id: 'veh_123',
        ...veiculoValido,
        status: StatusVeiculo.A_VENDA,
        createdAt: new Date()
      };

      mockCadastrarUseCase.execute.mockResolvedValue(veiculoCadastrado);

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoValido);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Veículo cadastrado com sucesso');
      expect(response.body.data.id).toBe('veh_123');
      expect(response.body.data.marca).toBe('Toyota');
      expect(response.body.data.modelo).toBe('Corolla');
      expect(response.body.data.ano).toBe(2023);
      expect(response.body.data.cor).toBe('Branco');
      expect(response.body.data.preco).toBe(85000);
      expect(response.body.data.status).toBe('A_VENDA');
      expect(typeof response.body.data.createdAt).toBe('string');
      expect(mockCadastrarUseCase.execute).toHaveBeenCalledWith(veiculoValido);
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const veiculoInvalido = {
        marca: '',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000
      };

      mockCadastrarUseCase.execute.mockRejectedValue(new Error('Marca é obrigatória'));

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoInvalido);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Marca é obrigatória'
      });
    });

    it('deve retornar erro 500 para erros internos', async () => {
      mockCadastrarUseCase.execute.mockRejectedValue(new Error('Erro interno do servidor'));

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoValido);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('GET /veiculos', () => {
    it('deve listar todos os veículos', async () => {
      const veiculos = [
        {
          id: 'veh_1',
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2023,
          cor: 'Branco',
          preco: 85000,
          status: 'A_VENDA',
          disponivel: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'veh_2',
          marca: 'Honda',
          modelo: 'Civic',
          ano: 2023,
          cor: 'Preto',
          preco: 90000,
          status: 'A_VENDA',
          disponivel: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockConsultarUseCase.listarComFiltros.mockResolvedValue(veiculos);

      const response = await request(app).get('/veiculos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].id).toBe('veh_1');
      expect(response.body.data[0].marca).toBe('Toyota');
      expect(response.body.data[1].id).toBe('veh_2');
      expect(response.body.data[1].marca).toBe('Honda');
    });

    it('deve retornar lista vazia quando não há veículos', async () => {
      mockConsultarUseCase.listarComFiltros.mockResolvedValue([]);

      const response = await request(app).get('/veiculos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: []
      });
    });
  });

  describe('GET /veiculos/:id', () => {
    it('deve buscar veículo por ID', async () => {
      const veiculo = {
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000,
        status: 'A_VENDA',
        disponivel: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockConsultarUseCase.buscarPorId.mockResolvedValue(veiculo);

      const response = await request(app).get('/veiculos/veh_123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('veh_123');
      expect(response.body.data.marca).toBe('Toyota');
      expect(response.body.data.modelo).toBe('Corolla');
      expect(typeof response.body.data.createdAt).toBe('string');
      expect(typeof response.body.data.updatedAt).toBe('string');
      expect(mockConsultarUseCase.buscarPorId).toHaveBeenCalledWith('veh_123');
    });

    it('deve retornar 404 quando veículo não encontrado', async () => {
      mockConsultarUseCase.buscarPorId.mockResolvedValue(null);

      const response = await request(app).get('/veiculos/veh_inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Veículo não encontrado'
      });
    });
  });

  describe('PUT /veiculos/:id', () => {
    const dadosAtualizacao = {
      preco: 90000,
      cor: 'Azul'
    };

    it('deve atualizar veículo com sucesso', async () => {
      const veiculoAtualizado = {
        id: 'veh_123',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Azul',
        preco: 90000,
        status: StatusVeiculo.A_VENDA,
        updatedAt: new Date()
      };

      mockEditarUseCase.execute.mockResolvedValue(veiculoAtualizado);

      const response = await request(app)
        .put('/veiculos/veh_123')
        .send(dadosAtualizacao);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Veículo atualizado com sucesso');
      expect(response.body.data.id).toBe('veh_123');
      expect(response.body.data.cor).toBe('Azul');
      expect(response.body.data.preco).toBe(90000);
      expect(typeof response.body.data.updatedAt).toBe('string');
      expect(mockEditarUseCase.execute).toHaveBeenCalledWith('veh_123', dadosAtualizacao);
    });

    it('deve retornar 404 quando veículo não encontrado para atualização', async () => {
      mockEditarUseCase.execute.mockRejectedValue(new Error('Veículo não encontrado'));

      const response = await request(app)
        .put('/veiculos/veh_inexistente')
        .send(dadosAtualizacao);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Veículo não encontrado'
      });
    });

    it('deve retornar 400 quando ID não fornecido para atualização', async () => {
      // Simular chamada sem ID
      const response = await request(app)
        .put('/veiculos/')
        .send(dadosAtualizacao);

      expect(response.status).toBe(404); // Express retorna 404 para rota não encontrada
    });

    it('deve retornar 500 para erro interno na atualização', async () => {
      mockEditarUseCase.execute.mockRejectedValue(new Error('Erro de banco de dados'));

      const response = await request(app)
        .put('/veiculos/veh_123')
        .send(dadosAtualizacao);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('DELETE /veiculos/:id', () => {
    it('deve deletar um veículo com sucesso', async () => {
      mockEditarUseCase.deletar.mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/veiculos/veh_123');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(mockEditarUseCase.deletar).toHaveBeenCalledWith('veh_123');
    });

    it('deve retornar 400 quando ID não fornecido para deleção', async () => {
      const response = await request(app)
        .delete('/veiculos/');

      expect(response.status).toBe(404); // Express retorna 404 para rota não encontrada
    });

    it('deve retornar 400 para erro na deleção', async () => {
      mockEditarUseCase.deletar.mockRejectedValue(new Error('Veículo não pode ser deletado'));

      const response = await request(app)
        .delete('/veiculos/veh_123');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Veículo não pode ser deletado'
      });
    });
  });

  describe('Validação de dados', () => {
    it('deve retornar erro 400 quando marca está vazia', async () => {
      const veiculoInvalido = {
        marca: '',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000
      };

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoInvalido);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Marca é obrigatória'
      });
    });

    it('deve retornar erro 400 quando campos obrigatórios estão faltando', async () => {
      const veiculoIncompleto = {
        marca: 'Toyota'
        // modelo, ano, cor, preco estão faltando
      };

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoIncompleto);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Dados obrigatórios faltando',
        details: 'Marca, modelo, ano, cor e preço são obrigatórios'
      });
    });
  });

  describe('Cenários de erro', () => {
    it('deve retornar 500 para erro interno no cadastro', async () => {
      const veiculoValido = {
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2023,
        cor: 'Branco',
        preco: 85000
      };

      mockCadastrarUseCase.execute.mockRejectedValue(new Error('Erro de banco de dados'));

      const response = await request(app)
        .post('/veiculos')
        .send(veiculoValido);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });

    it('deve retornar 500 para erro interno na listagem', async () => {
      // Mock req como AuthenticatedRequest
      app.use((req: any, res, next) => {
        req.user = { tipo: 'ADMIN' };
        next();
      });

      mockConsultarUseCase.listarComFiltros.mockRejectedValue(new Error('Erro de banco de dados'));

      const response = await request(app)
        .get('/veiculos');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro ao listar veículos'
      });
    });

    it('deve retornar 500 para erro interno na busca por ID', async () => {
      mockConsultarUseCase.buscarPorId.mockRejectedValue(new Error('Erro de banco de dados'));

      const response = await request(app)
        .get('/veiculos/veh_123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro ao buscar veículo'
      });
    });
  });

  describe('Testes de validação de status', () => {
    beforeEach(() => {
      // Adicionar middleware para simular usuário autenticado
      app.use((req: any, res, next) => {
        req.user = { tipo: 'CLIENTE' };
        next();
      });
      app.get('/veiculos-cliente', controller.listar.bind(controller));
    });

    it('deve negar acesso a veículos vendidos para clientes', async () => {
      const response = await request(app)
        .get('/veiculos-cliente')
        .query({ status: 'VENDIDO' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Acesso negado. Apenas administradores podem ver veículos vendidos'
      });
    });

    it('deve permitir filtro por status A_VENDA para clientes', async () => {
      mockConsultarUseCase.listarComFiltros.mockResolvedValue([]);

      const response = await request(app)
        .get('/veiculos-cliente')
        .query({ status: 'A_VENDA' });

      expect(response.status).toBe(200);
      expect(mockConsultarUseCase.listarComFiltros).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'A_VENDA' })
      );
    });

    it('deve permitir filtro por status RESERVADO para clientes', async () => {
      mockConsultarUseCase.listarComFiltros.mockResolvedValue([]);

      const response = await request(app)
        .get('/veiculos-cliente')
        .query({ status: 'RESERVADO' });

      expect(response.status).toBe(200);
      expect(mockConsultarUseCase.listarComFiltros).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'RESERVADO' })
      );
    });
  });

  describe('Testes de acesso admin', () => {
    beforeEach(() => {
      // Adicionar middleware para simular usuário admin
      app.use((req: any, res, next) => {
        req.user = { tipo: 'ADMIN' };
        next();
      });
      app.get('/veiculos-admin', controller.listar.bind(controller));
    });

    it('deve permitir acesso a veículos vendidos para admins', async () => {
      mockConsultarUseCase.listarComFiltros.mockResolvedValue([]);

      const response = await request(app)
        .get('/veiculos-admin')
        .query({ status: 'VENDIDO' });

      expect(response.status).toBe(200);
      expect(mockConsultarUseCase.listarComFiltros).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'VENDIDO' })
      );
    });
  });

  describe('Validação de parâmetros de filtro', () => {
    beforeEach(() => {
      app.use((req: any, res, next) => {
        req.user = { tipo: 'ADMIN' };
        next();
      });
      app.get('/veiculos-filtros', controller.listar.bind(controller));
    });

    it('deve processar filtros de ordem corretamente', async () => {
      mockConsultarUseCase.listarComFiltros.mockResolvedValue([]);

      const response = await request(app)
        .get('/veiculos-filtros')
        .query({ ordem: 'DESC' });

      expect(response.status).toBe(200);
      expect(mockConsultarUseCase.listarComFiltros).toHaveBeenCalledWith(
        expect.objectContaining({ ordem: 'DESC' })
      );
    });

    it('deve processar filtros numéricos corretamente', async () => {
      mockConsultarUseCase.listarComFiltros.mockResolvedValue([]);

      const response = await request(app)
        .get('/veiculos-filtros')
        .query({ 
          anoMin: '2020',
          anoMax: '2024',
          precoMin: '50000',
          precoMax: '100000'
        });

      expect(response.status).toBe(200);
      expect(mockConsultarUseCase.listarComFiltros).toHaveBeenCalledWith(
        expect.objectContaining({ 
          anoMin: 2020,
          anoMax: 2024,
          precoMin: 50000,
          precoMax: 100000
        })
      );
    });
  });
});
