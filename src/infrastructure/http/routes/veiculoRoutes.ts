import { Router } from 'express';
import { VeiculoController } from '../controllers/VeiculoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const veiculoController = new VeiculoController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Veiculo:
 *       type: object
 *       required:
 *         - marca
 *         - modelo
 *         - ano
 *         - cor
 *         - preco
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do veículo
 *         marca:
 *           type: string
 *           description: Marca do veículo
 *           example: "Toyota"
 *         modelo:
 *           type: string
 *           description: Modelo do veículo
 *           example: "Corolla"
 *         ano:
 *           type: integer
 *           description: Ano de fabricação
 *           example: 2023
 *         cor:
 *           type: string
 *           description: Cor do veículo
 *           example: "Prata"
 *         preco:
 *           type: number
 *           format: float
 *           description: Preço do veículo
 *           example: 85000.00
 *         descricao:
 *           type: string
 *           description: Descrição adicional do veículo
 *           example: "Veículo em excelente estado"
 *         status:
 *           type: string
 *           enum: [DISPONIVEL, VENDIDO, RESERVADO]
 *           description: Status do veículo
 *         disponivel:
 *           type: boolean
 *           description: Se o veículo está disponível para venda
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de cadastro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     
 *     CadastrarVeiculoInput:
 *       type: object
 *       required:
 *         - marca
 *         - modelo
 *         - ano
 *         - cor
 *         - preco
 *       properties:
 *         marca:
 *           type: string
 *           description: Marca do veículo
 *           example: "Toyota"
 *         modelo:
 *           type: string
 *           description: Modelo do veículo
 *           example: "Corolla"
 *         ano:
 *           type: integer
 *           description: Ano de fabricação
 *           example: 2023
 *         cor:
 *           type: string
 *           description: Cor do veículo
 *           example: "Prata"
 *         preco:
 *           type: number
 *           format: float
 *           description: Preço do veículo
 *           example: 85000.00
 *         descricao:
 *           type: string
 *           description: Descrição adicional do veículo
 *           example: "Veículo em excelente estado"
 */

/**
 * @swagger
 * /api/veiculos:
 *   post:
 *     tags: [Veículos]
 *     summary: Cadastrar novo veículo
 *     description: Cadastra um novo veículo no sistema. Requer autenticação de administrador.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CadastrarVeiculoInput'
 *     responses:
 *       201:
 *         description: Veículo cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.post('/', authMiddleware, (req, res) => veiculoController.cadastrar(req, res));

/**
 * @swagger
 * /api/veiculos:
 *   get:
 *     tags: [Veículos]
 *     summary: Listar veículos
 *     description: Lista veículos com filtros opcionais. Admins podem ver veículos vendidos.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *         example: "Toyota"
 *       - in: query
 *         name: modelo
 *         schema:
 *           type: string
 *         description: Filtrar por modelo
 *         example: "Corolla"
 *       - in: query
 *         name: anoMin
 *         schema:
 *           type: integer
 *         description: Ano mínimo
 *         example: 2020
 *       - in: query
 *         name: anoMax
 *         schema:
 *           type: integer
 *         description: Ano máximo
 *         example: 2024
 *       - in: query
 *         name: precoMin
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *         example: 50000
 *       - in: query
 *         name: precoMax
 *         schema:
 *           type: number
 *         description: Preço máximo
 *         example: 100000
 *       - in: query
 *         name: ordem
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Ordem de classificação por preço (ASC = crescente, DESC = decrescente)
 *         example: ASC
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [A_VENDA, VENDIDO, RESERVADO]
 *         description: Filtrar por status (VENDIDO apenas para admins)
 *         example: A_VENDA
 *     responses:
 *       200:
 *         description: Lista de veículos com filtros aplicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 5
 *                 filtros:
 *                   type: object
 *                   properties:
 *                     marca:
 *                       type: string
 *                     modelo:
 *                       type: string
 *                     anoMin:
 *                       type: number
 *                     anoMax:
 *                       type: number
 *                     precoMin:
 *                       type: number
 *                     precoMax:
 *                       type: number
 *                     status:
 *                       type: string
 *                     ordem:
 *                       type: string
 *                 veiculos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Veiculo'
 *       403:
 *         description: Acesso negado - apenas admins podem ver veículos vendidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', (req, res) => veiculoController.listar(req, res));

/**
 * @swagger
 * /api/veiculos/{id}:
 *   get:
 *     tags: [Veículos]
 *     summary: Buscar veículo por ID
 *     description: Retorna os detalhes de um veículo específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *         example: "vei_1692285600000_abc123def"
 *     responses:
 *       200:
 *         description: Detalhes do veículo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo'
 *       404:
 *         description: Veículo não encontrado
 */
router.get('/:id', (req, res) => veiculoController.buscarPorId(req, res));

/**
 * @swagger
 * /api/veiculos/{id}:
 *   put:
 *     tags: [Veículos]
 *     summary: Atualizar veículo
 *     description: Atualiza os dados de um veículo. Requer autenticação de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *         example: "vei_1692285600000_abc123def"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CadastrarVeiculoInput'
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Veiculo'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Veículo não encontrado
 */
router.put('/:id', authMiddleware, (req, res) => veiculoController.atualizar(req, res));

/**
 * @swagger
 * /api/veiculos/{id}:
 *   delete:
 *     tags: [Veículos]
 *     summary: Deletar veículo
 *     description: Remove um veículo do sistema. Requer autenticação de administrador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *         example: "vei_1692285600000_abc123def"
 *     responses:
 *       204:
 *         description: Veículo deletado com sucesso
 *       401:
 *         description: Token de acesso inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *       404:
 *         description: Veículo não encontrado
 */
router.delete('/:id', authMiddleware, (req, res) => veiculoController.deletar(req, res));

export default router;
