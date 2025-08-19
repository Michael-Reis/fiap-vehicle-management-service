import { Request, Response } from 'express';
import { 
  CadastrarVeiculoUseCase, 
  ConsultarVeiculoUseCase, 
  EditarVeiculoUseCase 
} from '../../../application/usecases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { OrdemClassificacao } from '../../../domain/repositories/VeiculoRepository';
import { StatusVeiculo } from '../../../domain/entities/Veiculo';
import { TipoUsuario } from '../../../domain/entities/Usuario';

export class VeiculoController {
  private cadastrarVeiculoUseCase: CadastrarVeiculoUseCase;
  private consultarVeiculoUseCase: ConsultarVeiculoUseCase;
  private editarVeiculoUseCase: EditarVeiculoUseCase;

  constructor() {
    this.cadastrarVeiculoUseCase = new CadastrarVeiculoUseCase();
    this.consultarVeiculoUseCase = new ConsultarVeiculoUseCase();
    this.editarVeiculoUseCase = new EditarVeiculoUseCase();
  }

  async cadastrar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { marca, modelo, ano, cor, preco, descricao } = req.body;

      // Validações básicas
      if (!marca || !modelo || !ano || !cor || !preco) {
        res.status(400).json({ 
          error: 'Dados obrigatórios faltando',
          details: 'Marca, modelo, ano, cor e preço são obrigatórios'
        });
        return;
      }

      const result = await this.cadastrarVeiculoUseCase.execute({
        marca,
        modelo,
        ano,
        cor,
        preco,
        descricao
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Erro ao cadastrar veículo:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao cadastrar veículo'
      });
    }
  }

  async listar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { marca, modelo, anoMin, anoMax, precoMin, precoMax, ordem, status } = req.query;

      // Validar parâmetro de ordem
      const ordemValida: OrdemClassificacao | undefined = ordem === 'DESC' ? 'DESC' : ordem === 'ASC' ? 'ASC' : undefined;
      
      // Verificar se o usuário pode ver veículos vendidos
      let statusFiltro: StatusVeiculo | undefined;
      if (status) {
        const statusString = status as string;
        
        // Apenas admins podem ver veículos vendidos
        if (statusString === StatusVeiculo.VENDIDO) {
          if (!req.user || req.user.tipo !== TipoUsuario.ADMIN) {
            res.status(403).json({ 
              error: 'Acesso negado. Apenas administradores podem ver veículos vendidos'
            });
            return;
          }
          statusFiltro = StatusVeiculo.VENDIDO;
        } else if (statusString === StatusVeiculo.A_VENDA) {
          statusFiltro = StatusVeiculo.A_VENDA;
        } else if (statusString === StatusVeiculo.RESERVADO) {
          statusFiltro = StatusVeiculo.RESERVADO;
        }
      }

      const filtros = {
        marca: marca as string,
        modelo: modelo as string,
        anoMin: anoMin ? parseInt(anoMin as string) : undefined,
        anoMax: anoMax ? parseInt(anoMax as string) : undefined,
        precoMin: precoMin ? parseFloat(precoMin as string) : undefined,
        precoMax: precoMax ? parseFloat(precoMax as string) : undefined,
        ordem: ordemValida,
        status: statusFiltro
      };

      const result = await this.consultarVeiculoUseCase.listarComFiltros(filtros);
      
      res.status(200).json({
        total: result.length,
        filtros: {
          marca: filtros.marca,
          modelo: filtros.modelo,
          anoMin: filtros.anoMin,
          anoMax: filtros.anoMax,
          precoMin: filtros.precoMin,
          precoMax: filtros.precoMax,
          status: statusFiltro || 'Todos disponíveis',
          ordem: ordemValida || 'Sem ordenação'
        },
        veiculos: result
      });
    } catch (error: any) {
      console.error('Erro ao listar veículos:', error);
      res.status(500).json({ 
        error: error.message || 'Erro ao listar veículos'
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ 
          error: 'ID do veículo é obrigatório'
        });
        return;
      }

      const result = await this.consultarVeiculoUseCase.buscarPorId(id);
      
      if (!result) {
        res.status(404).json({ 
          error: 'Veículo não encontrado'
        });
        return;
      }

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({ 
        error: error.message || 'Erro ao buscar veículo'
      });
    }
  }

  async atualizar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { marca, modelo, ano, cor, preco, descricao } = req.body;

      if (!id) {
        res.status(400).json({ 
          error: 'ID do veículo é obrigatório'
        });
        return;
      }

      const result = await this.editarVeiculoUseCase.execute(id, {
        marca,
        modelo,
        ano,
        cor,
        preco,
        descricao
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao atualizar veículo:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao atualizar veículo'
      });
    }
  }

  async deletar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ 
          error: 'ID do veículo é obrigatório'
        });
        return;
      }

      await this.editarVeiculoUseCase.deletar(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Erro ao deletar veículo:', error);
      res.status(400).json({ 
        error: error.message || 'Erro ao deletar veículo'
      });
    }
  }
}
